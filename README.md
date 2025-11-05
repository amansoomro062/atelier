# Atelier 🎨

An open-source AI Prompt Engineering Playground that empowers users to craft, test, and refine system prompts with live code execution.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

- **🤖 Multi-Provider AI Support**: Test prompts with OpenAI (GPT-4, GPT-3.5) and Anthropic (Claude 3.5 Sonnet, Haiku)
- **⚡ Real-time Streaming**: See AI responses stream in real-time
- **💻 Live Code Execution**: Execute JavaScript code directly in the browser
- **🎨 Monaco Editor**: VS Code-like editing experience with syntax highlighting
- **🌓 Dark/Light Mode**: Beautiful themes that adapt to your preference
- **🔐 Privacy-First**: BYOK (Bring Your Own Key) - API keys stored locally, never sent to our servers
- **📱 Responsive Design**: Resizable panels that adapt to your workflow
- **🚀 Zero Setup**: No backend required for MVP features

## 🎯 Use Cases

- **Developers**: Test system prompts for AI-powered applications
- **Prompt Engineers**: Optimize and iterate on prompt templates
- **Educators**: Teach prompt engineering concepts with live examples
- **Content Creators**: Standardize AI-assisted workflows
- **Companies**: Build and validate AI integrations

## 🚀 Quick Start

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- OpenAI and/or Anthropic API keys

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/atelier.git
cd atelier

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see Atelier in action!

### First Steps

1. **Add API Keys**: Click the "API Keys" button in the header
2. **Enter your OpenAI or Anthropic API key** (stored locally in your browser)
3. **Write a system prompt**: Guide the AI's behavior
4. **Write a user prompt**: Ask the AI to generate code
5. **Click "Run Prompt"**: See the streaming response
6. **Test the code**: Click "Run Code" to execute JavaScript

## 🏗️ Architecture

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

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **AI SDKs**: OpenAI, Anthropic
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)

## 📝 Usage Examples

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

## 🔐 Privacy & Security

- **Local Storage**: API keys are stored only in your browser's localStorage
- **No Backend**: Keys never touch our servers
- **Client-Side Execution**: Code runs in your browser sandbox
- **Open Source**: Audit the code yourself

## 🗺️ Roadmap

### Phase 1: MVP ✅ (Current)
- [x] OpenAI & Anthropic integration
- [x] Streaming responses
- [x] Basic code execution
- [x] API key management
- [x] Dark/light themes

### Phase 2: Community Features (Coming Soon)
- [ ] User authentication
- [ ] Prompt template library
- [ ] Share prompts with the community
- [ ] Upvote/downvote system
- [ ] User profiles

### Phase 3: Advanced Features
- [ ] Side-by-side model comparison
- [ ] WebContainer integration (full Node.js)
- [ ] React component preview
- [ ] Prompt version history
- [ ] Analytics dashboard

### Phase 4: Ecosystem
- [ ] VS Code extension
- [ ] Browser extension
- [ ] API for programmatic access
- [ ] LangChain/LlamaIndex export

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editing experience
- [Next.js](https://nextjs.org/) team for the amazing framework
- OpenAI and Anthropic for their powerful AI models

## 📧 Contact

- Twitter: [@yourusername](https://twitter.com/yourusername)
- GitHub: [@yourusername](https://github.com/yourusername)

## ⭐ Star History

If you find Atelier useful, please consider giving it a star! It helps the project grow and motivates continued development.

---

Built with ❤️ by [Your Name](https://yourwebsite.com)
