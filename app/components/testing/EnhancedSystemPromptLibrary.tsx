"use client";

import { useState, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  FileText,
  Check,
  Search,
  X,
  CheckSquare,
  UploadCloud,
} from "lucide-react";

interface EnhancedSystemPromptLibraryProps {
  onSelectPrompts?: (prompts: SystemPromptTemplate[]) => void;
  selectedPrompts?: Set<string>;
}

export function EnhancedSystemPromptLibrary({
  onSelectPrompts,
  selectedPrompts = new Set(),
}: EnhancedSystemPromptLibraryProps) {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    prompts.forEach((prompt) => {
      prompt.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [prompts]);

  // Filter prompts based on search and tag
  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesSearch =
        !searchQuery ||
        prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        !selectedTag || prompt.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [prompts, searchQuery, selectedTag]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.type === "text/plain" ||
        file.type === "text/markdown" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".md")
    );

    if (files.length === 0) {
      toast.error("Please drop .txt or .md files");
      return;
    }

    for (const file of files) {
      try {
        await importPromptFromFile(file);
        toast.success(`Imported ${file.name}`);
      } catch (error) {
        toast.error(`Failed to import ${file.name}`);
      }
    }
  };

  const handleToggleSelect = (promptId: string) => {
    if (bulkSelectMode) {
      const newBulkSelected = new Set(bulkSelected);
      if (newBulkSelected.has(promptId)) {
        newBulkSelected.delete(promptId);
      } else {
        newBulkSelected.add(promptId);
      }
      setBulkSelected(newBulkSelected);
    } else {
      const newSelected = new Set(selectedPrompts);
      if (newSelected.has(promptId)) {
        newSelected.delete(promptId);
      } else {
        newSelected.add(promptId);
      }
      onSelectPrompts?.(prompts.filter((p) => newSelected.has(p.id)));
    }
  };

  const handleBulkDelete = () => {
    if (bulkSelected.size === 0) {
      toast.error("No prompts selected");
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete ${bulkSelected.size} prompt(s)?`
      )
    ) {
      bulkSelected.forEach((id) => deletePrompt(id));
      setBulkSelected(new Set());
      setBulkSelectMode(false);
      toast.success(`Deleted ${bulkSelected.size} prompt(s)`);
    }
  };

  const handleSelectAll = () => {
    if (bulkSelected.size === filteredPrompts.length) {
      setBulkSelected(new Set());
    } else {
      setBulkSelected(new Set(filteredPrompts.map((p) => p.id)));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2 p-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">System Prompt Library</h2>
            <p className="text-sm text-muted-foreground">
              {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} saved
              {filteredPrompts.length !== prompts.length &&
                ` · ${filteredPrompts.length} shown`}
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
                  Add
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

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        {bulkSelectMode && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <Button size="sm" variant="outline" onClick={handleSelectAll}>
              <CheckSquare className="mr-2 h-4 w-4" />
              {bulkSelected.size === filteredPrompts.length
                ? "Deselect All"
                : "Select All"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkSelected.size === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({bulkSelected.size})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setBulkSelectMode(false);
                setBulkSelected(new Set());
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {!bulkSelectMode && prompts.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => setBulkSelectMode(true)}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Bulk Select
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div
          className={`space-y-2 p-4 ${
            isDragging ? "bg-primary/5 border-2 border-dashed border-primary" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {filteredPrompts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                {prompts.length === 0 ? (
                  <>
                    <UploadCloud className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-center text-muted-foreground mb-2">
                      No prompts yet
                    </p>
                    <p className="text-center text-sm text-muted-foreground">
                      Add one manually or drag & drop .txt/.md files here
                    </p>
                  </>
                ) : (
                  <>
                    <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-center text-muted-foreground">
                      No prompts match your search
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredPrompts.map((prompt) => {
              const isSelected = bulkSelectMode
                ? bulkSelected.has(prompt.id)
                : selectedPrompts.has(prompt.id);

              return (
                <Card
                  key={prompt.id}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleToggleSelect(prompt.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 flex items-start gap-2">
                        {bulkSelectMode && (
                          <Checkbox
                            checked={bulkSelected.has(prompt.id)}
                            onCheckedChange={() => handleToggleSelect(prompt.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-base">
                            {!bulkSelectMode && isSelected && (
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
                      </div>
                      {!bulkSelectMode && (
                        <div
                          className="flex gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground font-mono">
                      {prompt.content}
                    </p>
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {prompt.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
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
              );
            })
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
