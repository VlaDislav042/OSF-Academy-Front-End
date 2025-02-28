# Storefront Reference Architecture (SFRA)

This is a repository for the Storefront Reference Architecture reference application.

Storefront Reference Architecture has a base cartridge (`app_storefront_base`) provided by Commerce Cloud that is never directly customized or edited. Instead, customization cartridges are layered on top of the base cartridge. This change is intended to allow for easier adoption of new features and bug fixes.
Storefront Reference Architecture supplies an [plugin_applepay](https://github.com/SalesforceCommerceCloud/plugin-applepay) plugin cartridge to demonstrate how to layer customizations for the reference application.

Your feedback on the ease-of-use and limitations of this new architecture is invaluable during the developer preview. Particularly, feedback on any issues you encounter or workarounds you develop for efficiently customizing the base cartridge without editing it directly.


# The latest version

The latest version of SFRA is 7.0.0

# Requirements
------------

NodeJS version 16.x.x (to install and manage NodeJS see https://github.com/coreybutler/nvm-windows for Windows or https://github.com/creationix/nvm for MacOS/Linux)

# Getting Started

1. Clone this repository.

2. Run `npm install` to install all of the local dependencies (SFRA has been tested with Node v18.19 and is recommended)

3. Create `dw.json` file in the root of the project. Providing a [WebDAV access key from BM](https://help.salesforce.com/s/articleView?id=cc.b2c_access_keys_for_business_manager.htm&type=5) in the `password` field is optional, as you will be prompted if it is not provided.
```json
{
    "hostname": "your-sandbox-hostname.demandware.net",
    "username": "AM username like me.myself@company.com",
    "password": "your_webdav_access_key",
    "code-version": "version_to_upload_to",
    "cartridgesPath": "app_training:app_storefront_base:bm_app_storefront_base"
}
```


4. Use https://github.com/SalesforceCommerceCloud/storefrontdata to zip and import site data on your sandbox.

5. Add the `app_storefront_base` cartridge to your cartridge path in _Administration >  Sites >  Manage Sites > RefArch - Settings_ (Note: This should already be populated by the sample data in Step 6).

6. Add `app_training` cartridge to your cartridge path. Same as on item 7. It should look like the following `app_training:app_storefront_base`

7. You should now be ready to navigate to and use your site.

# NPM scripts
Use the provided NPM scripts to compile and upload changes to your Sandbox.

## Linting your code

`npm run lint` - Execute linting for all JavaScript and SCSS files in the project. You should run this command before committing your code.

## Watching for changes and uploading

`npm run dev` - Watches everything and recompiles (if necessary) and uploads to the sandbox. Requires a valid `dw.json` file at the root that is configured for the sandbox to upload.

## Uploading

### Using Prophet's VS Code Extension

Install Prophet's VS Code Extension: https://marketplace.visualstudio.com/items?itemName=SqrTT.prophet

This repository already contains the needed .vscode/launch.json file. The only thing you need to do is to install the extension and press CTRL (CMD on Macos) + SHIFT + P and choose the option "Prophet: Enable Upload". Then, whenever you change a file and save it, it will be automatically uploaded to the server.

It also requires a valid dw.json file at the root that is configured for the sandbox to upload.

## Training Cartridge
For training purposes, all your work should be done in the `app_training` cartridge.