# Atelier

An open-source AI Prompt Engineering Playground that empowers users to craft, test, and refine system prompts with live code execution.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

### Editor Mode
- **Multi-Provider AI Support**: Test prompts with OpenAI (GPT-4o, GPT-4o-mini, GPT-4, GPT-3.5) and Anthropic (Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus)
- **Conversational Mode**: Multi-turn conversations with persistent history and context
- **Token Tracking**: Real-time token usage monitoring (prompt/completion/total) with cumulative statistics
- **Vision Support**: Upload and analyze images with vision-capable models
- **Real-time Streaming**: See AI responses stream in real-time
- **Fullscreen Mode**: Distraction-free writing with expandable prompt editor
- **Live Code Execution**: Execute JavaScript code directly in the browser
- **Monaco Editor**: VS Code-like editing experience with syntax highlighting
- **History & Stats**: Track conversation history with detailed token usage analytics

### Testing Mode (NEW!)
- **System Prompt Library**: Store, organize, and manage multiple system prompts
- **File Import**: Upload system prompts from files (.txt, .md)
- **Batch Testing**: Run multiple prompts against multiple test cases simultaneously
- **Side-by-Side Comparison**: Compare outputs from different prompts visually
- **Evaluation Metrics**: Track response time, token usage, and costs
- **Export Results**: Download test results as JSON for analysis

### General
- **Refined UI**: Tabbed interface with connected design and vibrant purple accent colors
- **Dark/Light Mode**: Sophisticated navy-purple dark mode and warm off-white light mode
- **Privacy-First**: BYOK (Bring Your Own Key) - API keys stored locally, never sent to our servers
- **Responsive Design**: Resizable panels with proper overflow handling
- **Zero Setup**: No backend required for MVP features
- **Keyboard Shortcuts**: Press Enter to run prompts, Shift+Enter for new lines

## Use Cases

- **Developers**: Test system prompts for AI-powered applications
- **Prompt Engineers**: Optimize and iterate on prompt templates
- **Educators**: Teach prompt engineering concepts with live examples
- **Content Creators**: Standardize AI-assisted workflows
- **Companies**: Build and validate AI integrations

## Quick Start

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- OpenAI and/or Anthropic API keys

### Installation

```bash
# Clone the repository
git clone https://github.com/amansoomro062/atelier.git
cd atelier

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see Atelier in action!

### Two Modes

Atelier has two powerful modes:

1. **Editor Mode** (Default): Traditional prompt engineering with live code execution
   - Write system and user prompts
   - See AI responses in real-time
   - Execute and test generated code

2. **Testing Mode** (NEW!): Advanced system prompt testing and comparison
   - Import and manage multiple system prompts
   - Create reusable test cases
   - Run batch tests across all prompts
   - Compare results side-by-side with metrics

Switch between modes using the tabs in the header. See [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed testing instructions.

### First Steps

1. **Add API Keys**: Click the "API Keys" button in the header
2. **Enter your OpenAI or Anthropic API key** (stored locally in your browser)
3. **Select a model**: Choose from the latest GPT-4o or Claude 3.7 Sonnet models
4. **Write a system prompt**: Guide the AI's behavior (use fullscreen mode for longer prompts)
5. **Write a user prompt**: Ask the AI to generate code or analyze images
6. **Optional**: Enable conversational mode for multi-turn conversations
7. **Optional**: Add images for vision-capable models
8. **Click "Run Prompt"** or press Enter: See the streaming response
9. **Track usage**: View token statistics in the Stats tab
10. **Test the code**: Click "Run Code" to execute JavaScript

## Architecture

```
├── app/
│   ├── api/                  # API routes
│   │   ├── openai/          # OpenAI streaming endpoint
│   │   └── anthropic/       # Anthropic streaming endpoint
│   ├── components/
│   │   ├── editor/          # Prompt & Code editors
│   │   ├── layout/          # Layout components
│   │   ├── preview/         # Output panel
│   │   └── settings/        # API key management
│   └── page.tsx             # Main entry point
├── lib/
│   ├── hooks/               # React hooks (useApiKeys, useLocalStorage)
│   ├── types/               # TypeScript types
│   └── utils/               # Utilities (code execution)
└── components/ui/           # shadcn/ui components
```

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **AI SDKs**: OpenAI, Anthropic
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)

## Usage Examples

### Example 1: Code Generation Prompt

**System Prompt**:
```
You are a helpful coding assistant. When asked to write code, provide clean, well-commented JavaScript that follows best practices.
```

**User Prompt**:
```
Write a function that calculates the Fibonacci sequence up to n terms.
```

**Result**: AI generates code → Test it live in the Code Editor → See output in Console

### Example 2: Prompt Engineering Testing

Test how different system prompts affect the same user query:

- Try: "You are a concise technical writer"
- Try: "You are a creative storyteller"
- Try: "You are a strict code reviewer"

Compare outputs to refine your prompt strategy!

## Privacy & Security

- **Local Storage**: API keys are stored only in your browser's localStorage
- **No Backend**: Keys never touch our servers
- **Client-Side Execution**: Code runs in your browser sandbox
- **Open Source**: Audit the code yourself

## Roadmap

### Phase 1: MVP ✅
- [x] OpenAI & Anthropic integration
- [x] Streaming responses
- [x] Basic code execution
- [x] API key management
- [x] Dark/light themes
- [x] Conversational mode with history
- [x] Token usage tracking
- [x] Vision support (image upload)
- [x] Latest AI models (GPT-4o, Claude 3.7 Sonnet, etc.)
- [x] Fullscreen editor mode
- [x] Refined UI with tabbed layout

### Phase 2: Enhanced Editor Features (In Progress)
- [x] Conversation history tracking
- [x] Token statistics dashboard
- [ ] Markdown rendering for AI responses
- [ ] Export conversation history
- [ ] Code execution in preview panel
- [ ] Detailed token cost calculations
- [ ] Prompt templates and snippets

### Phase 3: Community Features (Coming Soon)
- [ ] User authentication
- [ ] Prompt template library
- [ ] Share prompts with the community
- [ ] Upvote/downvote system
- [ ] User profiles

### Phase 4: Advanced Features
- [ ] Side-by-side model comparison
- [ ] WebContainer integration (full Node.js)
- [ ] React component preview
- [ ] Prompt version history
- [ ] Analytics dashboard

### Phase 5: Ecosystem
- [ ] VS Code extension
- [ ] Browser extension
- [ ] API for programmatic access
- [ ] LangChain/LlamaIndex export

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editing experience
- [Next.js](https://nextjs.org/) team for the amazing framework
- OpenAI and Anthropic for their powerful AI models
