# Maya Extension for Visual Studio Code

[![Version](https://vsmarketplacebadge.apphb.com/version/saviof.mayacode.svg)](https://marketplace.visualstudio.com/items?itemName=saviof.mayacode)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/saviof.mayacode.svg)](https://marketplace.visualstudio.com/items?itemName=saviof.mayacode)
[![Downloads](https://vsmarketplacebadge.apphb.com/downloads/saviof.mayacode.svg)](https://marketplace.visualstudio.com/items?itemName=saviof.mayacode)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/saviof.mayacode.svg)](https://marketplace.visualstudio.com/items?itemName=saviof.mayacode)

[![Average time to resolve an issue](https://isitmaintained.com/badge/resolution/artbycrunk/vscode-maya.svg)](https://isitmaintained.com/project/artbycrunk/vscode-maya "Average time to resolve an issue")
[![Percentage of issues still open](https://isitmaintained.com/badge/open/artbycrunk/vscode-maya.svg)](https://isitmaintained.com/project/artbycrunk/vscode-maya "Percentage of issues still open")

[![](https://img.shields.io/badge/TWITTER-%40artbycrunk-blue.svg?logo=twitter&style=flat)](https://twitter.com/artbycrunk)
[![](https://img.shields.io/badge/gitter-join_chat-1dce73.svg?style=flat&logo=gitter-white)](https://gitter.im/vscode-maya/vscode-maya)


A [Visual Studio Code](https://code.visualstudio.com/) [extension](https://marketplace.visualstudio.com/items?itemName=saviof.mayacode) with support for coding for Maya.

## Features

* Syntax Highlight MEL scripts.
* Hierarchical document tree in the [outline view](https://code.visualstudio.com/docs/getstarted/userinterface#_outline-view).
* [Breadcrumbs](https://code.visualstudio.com/updates/v1_26#_breadcrumbs) support.

* Autocomplete MEL commands as you type ( along with flag info )

  > ![Autocomplete MEL commands as you type](./images/autocomplete.gif "Autocomplete MEL commands as you type")

* Autocomplete MEL variables as you type

  > ![Autocomplete MEL variables as you type](./images/variables.gif "Autocomplete MEL variables as you type")

* Send code to Maya via command port (MEL or Python).

  > ![Send code to Maya via command port](./images/send_to_maya.gif "Send code to Maya via command port")

* Support auto closing brackets, quotes and ticks

  > ![Syntax Highlight MEL scripts](./images/syntax_highlight.gif "Syntax Highlight MEL scripts.")


## Useful commands

Open the Command Palette (Command+Shift+P on macOS and Ctrl+Shift+P on Windows/Linux) and type in one of the following commands:

Command | Description
--- | ---
```Maya: Send Python Code to Maya``` | Send Python code from current editor in Maya.
```Maya: Send MEL Code to Maya``` | Send MEL code from current editor in Maya.

You can also select a block of code in the editor 
and ```Right-click -> Send Code to Maya```, this is based on the current working language (Mel or Python).


## Opening the correct ports for Send to Maya Commands.

To open the correct ports in maya, you can use the following code.

`Note: If your using a extension version higher than 0.9, then MEL and Python code use the same port in maya.`

In the Maya script editor MEL Tab.
```
commandPort -name "localhost:7001" -sourceType "mel" -echoOutput;
```

## Snippets

|Prefixes|Description|
|--------|-----------|
|if|Code snippet for an if statement|
|if/else|Code snippet for an if statement with else|
|elseif|Code snippet for an else if|
|else|Code snippet for an else|
|do/while|Code snippet for a do while loop|
|switch/case|Code snippet for a switch case|
|proc|Code snippet for a procedure|
|proc(global)|Code snippet for a global procedure|
|for/in|Code snippet for a for loop|
|for|Code snippet for a for loop with counter|
|while|Code snippet for a for while loop|

## Requirements

Autodesk Maya tested using Maya 2016 Windows and Linux but should work with all versions.

## Issues, feature requests, and contributions

* If you come across a problem with the extension, please [file an issue](https://github.com/artbycrunk/vscode-maya/issues)
* Contributions are always welcome!
* Any and all feedback is appreciated and welcome!
  - If someone has already [filed an issue](https://github.com/artbycrunk/vscode-maya/issues) that encompasses your feedback, please leave a 👍/👎 reaction on the issue
  - Otherwise please file a new issue

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md)

See [Recent Releases](https://github.com/artbycrunk/vscode-maya/releases)

**Enjoy!**
