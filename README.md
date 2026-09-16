http://preprod.opsboard.13.207.194.76.nip.io:30737/login
# DevOps Task Manager - UI Service

A modern React frontend for the DevOps Task Manager application with microservices architecture.

## Tech Stack

- **React 18** with Vite for fast development
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom dark theme
- **React Router** for navigation
- **Axios** for API calls
- **React DnD** for drag and drop Kanban board
- **Recharts** for data visualization
- **React Query** for data fetching and caching
- **Lucide React** for icons

## Features

- **Authentication**: Login and register with JWT tokens
- **Dashboard**: 
  - Pie chart showing task completion percentage
  - Category-wise breakdown (CI/CD, Kubernetes, AWS, Security, Monitoring, Infrastructure)
  - Today's pending tasks
  - Priority indicators (High/Medium/Low)
- **Kanban Board**:
  - 3 columns (Todo, In Progress, Done)
  - Drag and drop cards between columns
  - Task cards with priority, category, and due date badges
  - Category filter
- **Task Management**:
  - Create, edit, and delete tasks
  - Add comments and notes
  - Due date with overdue highlighting in red
  - Priority levels with color coding
- **UI/UX**:
  - Dark mode by default with light mode toggle
  - Glass morphism cards
  - Smooth animations
  - Gradient buttons
  - Responsive design

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Running backend services:
  - auth-service (port 3001)
  - user-service (port 3002)
  - task-service (port 3003)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_USER_SERVICE_URL=http://localhost:3002
VITE_TASK_SERVICE_URL=http://localhost:3003
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Docker Deployment

Build the Docker image:
```bash
docker build -t ui-service .
```

Run the container:
```bash
docker run -p 80:80 \
  -e VITE_AUTH_SERVICE_URL=http://auth-service:3001 \
  -e VITE_USER_SERVICE_URL=http://user-service:3002 \
  -e VITE_TASK_SERVICE_URL=http://task-service:3003 \
  ui-service
```

### Multi-stage Dockerfile

The Dockerfile uses a 3-stage build:
1. **deps**: Installs dependencies
2. **builder**: Builds the React application
3. **production**: Serves the built app with nginx

No node_modules are included in the final image for security and size optimization.

## Project Structure

```
src/
├── components/
│   └── Layout.tsx          # Main layout with navigation
├── contexts/
│   ├── AuthContext.tsx     # Authentication state management
│   └── ThemeContext.tsx    # Dark/light theme management
├── lib/
│   ├── api.ts             # API client with Axios
│   └── utils.ts           # Utility functions
├── pages/
│   ├── Login.tsx          # Login page
│   ├── Register.tsx       # Registration page
│   ├── Dashboard.tsx      # Dashboard with charts
│   ├── Kanban.tsx         # Kanban board with drag & drop
│   └── TaskDetail.tsx     # Task detail and editing
├── types/
│   └── index.ts           # TypeScript type definitions
├── App.tsx                # Main app component with routing
├── main.tsx               # Application entry point
└── index.css              # Global styles with Tailwind
```

## API Endpoints

The frontend connects to the following backend services:

### Auth Service
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### User Service
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Task Service
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_AUTH_SERVICE_URL` | Auth service URL | `http://localhost:3001` |
| `VITE_USER_SERVICE_URL` | User service URL | `http://localhost:3002` |
| `VITE_TASK_SERVICE_URL` | Task service URL | `http://localhost:3003` |

## Theme Configuration

The application uses a custom dark theme with the following colors:
- Background: `#0a0a0f`
- Primary: `#4f46e5` (Electric Blue)
- Accent: `#06b6d4` (Cyan)
- Card: `#12121a`
- Border: `#1e1e2e`

## License

MIT

* [Create](https://docs.gitlab.com/user/project/repository/web_editor/#create-a-file) or [upload](https://docs.gitlab.com/user/project/repository/web_editor/#upload-a-file) files
* [Add files using the command line](https://docs.gitlab.com/topics/git/add_files/#add-files-to-a-git-repository) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.com/ai_devsecops1/task_manager_application/ui_service.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

* [Set up project integrations](https://gitlab.com/ai_devsecops1/task_manager_application/ui_service/-/settings/integrations)

## Collaborate with your team

* [Invite team members and collaborators](https://docs.gitlab.com/user/project/members/)
* [Create a new merge request](https://docs.gitlab.com/user/project/merge_requests/creating_merge_requests/)
* [Automatically close issues from merge requests](https://docs.gitlab.com/user/project/issues/managing_issues/#closing-issues-automatically)
* [Enable merge request approvals](https://docs.gitlab.com/user/project/merge_requests/approvals/)
* [Set auto-merge](https://docs.gitlab.com/user/project/merge_requests/auto_merge/)

## Test and Deploy

Use the built-in continuous integration in GitLab.

* [Get started with GitLab CI/CD](https://docs.gitlab.com/ci/quick_start/)
* [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/user/application_security/sast/)
* [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/topics/autodevops/requirements/)
* [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/user/clusters/agent/)
* [Set up protected environments](https://docs.gitlab.com/ci/environments/protected_environments/)

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thanks to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
