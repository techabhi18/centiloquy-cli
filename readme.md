# 🔧 Centiloquy CLI Tool

A developer-friendly CLI tool to **scaffold integration actions** for internal platforms. It auto-generates `integration` files containing a ready-to-use structure including:

- Field metadata
- Sample boilerplate logic

---

## 📦 Installation

To install this tool globally from npm:

```bash
npm install -g centiloquy-cli-tool
```

## 🚀 Usage

### 1. Create a New Integration

```bash
centiloquy-cli create
```

You’ll be prompted to enter the integration name. This will:

- Create a new folder with that name.
- Generate:
  - `YourIntegrationName.action.js`
  - `YourIntegrationName.action.json`
- Create a placeholder `logos/` directory for your integration logo.

**Example:**

```bash
Enter the integration name: MyIntegration
```

```arduino
MyIntegration/
├── MyIntegration.action.js
├── MyIntegration.action.json
└── logos/
    └── myIntegration.svg  # expected image file
```

### 2. Generate Field Parameters

After creating an integration, use the following command to auto-generate the dynamic field-handling logic inside the .action.js file:

```bash
centiloquy-cli generate MyIntegration/MyIntegration.action.js
```

This command will:

- Inject `getFieldParameter` extraction code into the `execute` method.
- Build a `requestData` object.
- Clean the data to remove `null`, `undefined`, or empty values using a `deepClean()` utility.
