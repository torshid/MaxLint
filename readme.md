MaxLint
======= 
> **MaxLint** is an extension which tries to automatically fix linting errors given by ESLint.

> In order to do that, it makes use of 3 packages which are [lebab](https://packagecontrol.io/packages/lebab), [Prettier](https://www.npmjs.com/package/prettier), and [ESLint](https://www.npmjs.com/package/eslint) itself.

Installation
------------
Before running this extension, make sure you have the dependencies installed.
```
npm -g install lebab prettier eslint
```
If you use Angular in your project, make sure that the package `eslint-plugin-angular` is also installed.

Usage
-----
Open a `.js` file, press `CTRL+SHIFT+P` to show all commands, and run **`Lint file`**.

You will then be notified that the process has started. You will also be notified when the process ends or in case an error occurs.

package.json
------------
**MaxLint** will try to localize the `package.json` of your project, so that the command is executed from the folder it is in. This can be helpful in case you have configuration files for Prettier or ESLint in that same directory.

In case you do not have the `package.json` file, the command will directly execute from the directory of the `.js` file you are linting.

Settings
-------------
You can customize the flags given to lebab, Prettier and ESLint by accessing the extension's settings.
The default values are:
- lebab: `-t arrow,multi-var`
- Prettier: `--arrow-parens avoid --print-width 120`
- ESLint: empty

Screenshots
-----------
![Main command](https://raw.githubusercontent.com/torshid/maxlint/master/screenshots/pic1.png)

![Notifications](https://raw.githubusercontent.com/torshid/maxlint/master/screenshots/pic2.png)

![Error](https://raw.githubusercontent.com/torshid/maxlint/master/screenshots/pic4.png)

![Status bar](https://raw.githubusercontent.com/torshid/maxlint/master/screenshots/pic3.png)