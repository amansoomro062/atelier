"use client";

import { useState } from "react";
import { SystemPromptTemplate } from "@/lib/types";
import { usePromptLibrary } from "@/lib/hooks/usePromptLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  FileText,
  Check,
} from "lucide-react";

interface SystemPromptLibraryProps {
  onSelectPrompts?: (prompts: SystemPromptTemplate[]) => void;
  selectedPrompts?: Set<string>;
}

export function SystemPromptLibrary({
  onSelectPrompts,
  selectedPrompts = new Set(),
}: SystemPromptLibraryProps) {
  const {
    prompts,
    isLoading,
    addPrompt,
    updatePrompt,
    deletePrompt,
    importPromptFromFile,
    exportPrompt,
  } = usePromptLibrary();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] =
    useState<SystemPromptTemplate | null>(null);
  const [newPrompt, setNewPrompt] = useState({
    name: "",
    description: "",
    content: "",
    tags: "",
  });

  const handleAddPrompt = () => {
    if (!newPrompt.name || !newPrompt.content) {
      toast.error("Name and content are required");
      return;
    }

    addPrompt({
      name: newPrompt.name,
      description: newPrompt.description,
      content: newPrompt.content,
      tags: newPrompt.tags.split(",").map((t) => t.trim()).filter(Boolean),
      source: "manual",
    });

    setNewPrompt({ name: "", description: "", content: "", tags: "" });
    setIsAddDialogOpen(false);
    toast.success("Prompt added successfully");
  };

  const handleUpdatePrompt = () => {
    if (!editingPrompt) return;

    updatePrompt(editingPrompt.id, {
      name: editingPrompt.name,
      description: editingPrompt.description,
      content: editingPrompt.content,
      tags: editingPrompt.tags,
    });

    setEditingPrompt(null);
    toast.success("Prompt updated successfully");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        await importPromptFromFile(file);
        toast.success(`Imported ${file.name}`);
      } catch (error) {
        toast.error(`Failed to import ${file.name}`);
      }
    }
    e.target.value = "";
  };

  const handleToggleSelect = (promptId: string) => {
    const newSelected = new Set(selectedPrompts);
    if (newSelected.has(promptId)) {
      newSelected.delete(promptId);
    } else {
      newSelected.add(promptId);
    }
    onSelectPrompts?.(prompts.filter((p) => newSelected.has(p.id)));
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">System Prompt Library</h2>
            <p className="text-sm text-muted-foreground">
              {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <div className="flex gap-2">
            <label htmlFor="file-upload">
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </span>
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Prompt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add System Prompt</DialogTitle>
                  <DialogDescription>
                    Create a new system prompt template
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newPrompt.name}
                      onChange={(e) =>
                        setNewPrompt({ ...newPrompt, name: e.target.value })
                      }
                      placeholder="e.g., Code Assistant"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Input
                      id="description"
                      value={newPrompt.description}
                      onChange={(e) =>
                        setNewPrompt({
                          ...newPrompt,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">System Prompt Content</Label>
                    <Textarea
                      id="content"
                      value={newPrompt.content}
                      onChange={(e) =>
                        setNewPrompt({ ...newPrompt, content: e.target.value })
                      }
                      placeholder="You are a helpful assistant..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newPrompt.tags}
                      onChange={(e) =>
                        setNewPrompt({ ...newPrompt, tags: e.target.value })
                      }
                      placeholder="e.g., coding, assistant, helper"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddPrompt}>Add Prompt</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {prompts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  No prompts yet. Add one manually or import from a file.
                </p>
              </CardContent>
            </Card>
          ) : (
            prompts.map((prompt) => (
              <Card
                key={prompt.id}
                className={`cursor-pointer transition-colors ${
                  selectedPrompts.has(prompt.id)
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => handleToggleSelect(prompt.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {selectedPrompts.has(prompt.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        {prompt.name}
                      </CardTitle>
                      {prompt.description && (
                        <CardDescription className="mt-1">
                          {prompt.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPrompt(prompt)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportPrompt(prompt)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this prompt?"
                            )
                          ) {
                            deletePrompt(prompt.id);
                            toast.success("Prompt deleted");
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground font-mono">
                    {prompt.content}
                  </p>
                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {prompt.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {prompt.source && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Source: {prompt.source}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPrompt}
        onOpenChange={() => setEditingPrompt(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit System Prompt</DialogTitle>
          </DialogHeader>
          {editingPrompt && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingPrompt.name}
                  onChange={(e) =>
                    setEditingPrompt({ ...editingPrompt, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingPrompt.description || ""}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingPrompt.content}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      content: e.target.value,
                    })
                  }
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  value={editingPrompt.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPrompt(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrompt}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
