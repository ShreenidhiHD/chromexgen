const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function generateFiles(options) {
  const projectDir = path.join(process.cwd(), options.name);

  // Create project directory if it doesn't exist
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir);
  }

  // Read the manifest template
  const manifestTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'manifest.template.json'), 'utf-8');
  let manifestContent = JSON.parse(manifestTemplate);

  // Customize manifest.json with user inputs
  manifestContent.name = options.name;
  manifestContent.permissions = options.permissions;

  // Handle background script
  if (options.includeBackground) {
    manifestContent.background.service_worker = 'background.js';
  }

  // Handle popup
  if (options.includePopup) {
    manifestContent.action.default_popup = 'popup.html';
  }

  // Write the customized manifest.json to the project directory
  fs.writeFileSync(path.join(projectDir, 'manifest.json'), JSON.stringify(manifestContent, null, 2));

  // Generate popup or background files based on user input
  if (options.includePopup) {
    const popupTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'popup.template.html'), 'utf-8');
    fs.writeFileSync(path.join(projectDir, 'popup.html'), popupTemplate);
  }

  if (options.includeBackground) {
    const backgroundTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'background.template.js'), 'utf-8');
    fs.writeFileSync(path.join(projectDir, 'background.js'), backgroundTemplate);
  }

  // Add Webpack configuration if selected
  if (options.bundler === 'Webpack') {
    const webpackConfig = `
      const path = require('path');

      module.exports = {
        entry: './src/index.js',
        output: {
          filename: 'bundle.js',
          path: path.resolve(__dirname, 'dist'),
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env']
                }
              }
            }
          ]
        },
        devServer: {
          contentBase: path.join(__dirname, 'dist'),
          hot: true
        }
      };
    `;

    fs.writeFileSync(path.join(projectDir, 'webpack.config.js'), webpackConfig);

    // Create Babel configuration
    const babelConfig = `
      {
        "presets": ["@babel/preset-env"]
      }
    `;
    fs.writeFileSync(path.join(projectDir, '.babelrc'), babelConfig);

    // Generate a basic package.json if it doesn't exist
    const packageJsonPath = path.join(projectDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      const basicPackageJson = {
        name: options.name,
        version: '1.0.0',
        main: 'index.js',
        scripts: {
          start: 'webpack',
          dev: 'webpack serve --open'
        },
        devDependencies: {}
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(basicPackageJson, null, 2));
    }

    // Add Webpack dependencies to package.json
    let packageJson = require(packageJsonPath);
    packageJson.devDependencies = {
      "webpack": "^5.0.0",
      "webpack-cli": "^4.0.0",
      "babel-loader": "^8.0.0",
      "@babel/core": "^7.0.0",
      "@babel/preset-env": "^7.0.0",
      "webpack-dev-server": "^4.0.0"
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Install Webpack and Babel dependencies
    exec('npm install', { cwd: projectDir }, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error installing dependencies: ${stderr}`);
      } else {
        console.log(`Webpack and Babel setup completed. Run "npm run dev" to start hot-reloading!`);
      }
    });
  }

  console.log(`Chrome extension "${options.name}" created successfully!`);
}

module.exports = { generateFiles };
