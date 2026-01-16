# TripWise ✈️

An AI-powered travel planning platform that goes beyond basic itineraries, built with Google's Gemini AI and modern web technologies.

## 🌟 Overview

TripWise leverages the power of generative AI to create personalized, intelligent travel itineraries. Whether you're planning a weekend getaway or a month-long adventure, TripWise helps you craft the perfect trip tailored to your preferences, budget, and travel style.

## ✨ Features

- **AI-Powered Itineraries**: Generate comprehensive travel plans using Google's Gemini AI
- **Personalized Recommendations**: Get suggestions based on your interests, budget, and travel style
- **Interactive Planning**: Refine and customize your itinerary with conversational AI
- **Smart Scheduling**: Optimize your daily activities for maximum enjoyment
- **Local Insights**: Discover hidden gems and authentic experiences
- **Budget Planning**: Get cost estimates and budget-friendly alternatives

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- A [Google AI Studio](https://ai.google.dev/) account
- Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jayanthwritescode/TripWise.git
   cd TripWise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

   You can get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 🏗️ Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **AI Integration**: Google Gemini AI API
- **Styling**: Tailwind CSS (or your preferred styling solution)
- **Type Safety**: TypeScript

## 📁 Project Structure

```
TripWise/
├── components/          # React components
├── services/           # API services and integrations
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── metadata.json       # App metadata
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (if configured)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🌐 Deployment

This app can be deployed to various platforms:

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **Google Cloud**: Deploy using Cloud Run or App Engine
- **Other platforms**: Any static hosting service that supports single-page applications

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Google AI Studio](https://ai.studio/)
- Powered by [Gemini AI](https://deepmind.google/technologies/gemini/)
- Created with React and Vite

## 📞 Support

If you encounter any issues or have questions:

- Open an issue on [GitHub](https://github.com/jayanthwritescode/TripWise/issues)
- View the app in [AI Studio](https://ai.studio/apps/drive/1PJZGb8iyj344u3AY6CWTdREUvJnm8Tob)

## 🗺️ Roadmap

- Multi-language support
- Save and share itineraries
- Real-time collaboration
- Integration with booking platforms
- Mobile app version
- Offline mode
- Custom travel preferences profiles

---

**Made with ❤️ by jayanthwritescode**

*Start planning your next adventure with AI!* ✨
