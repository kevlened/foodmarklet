# foodmarklet

This is a bookmarklet-only version of the awesome [plainoldrecipe](https://github.com/poundifdef/plainoldrecipe). This should be compatible with more websites, because the server version needs a whitelist of domains for security reasons, while this bookmarklet doesn't.

## Usage

1. Drag this bookmark to your bookmarks bar: [foodmarklet](https://example.com/REPLACE_SOURCE_WITH_CODE_IN_README)
2. Right-click the bookmark and change the location to this code:
```
javascript:void((()=>{let js=document.createElement('script');js.src="//unpkg.com/foodmarklet";document.head.appendChild(js)})());
```
3. Navigate to a recipe. [Example](https://www.seriouseats.com/recipes/2013/09/easy-gazpacho-recipe.html)
4. Click the `foodmarklet` bookmark

## Standalone

The normal bookmarklet loads js from a CDN so you automatically get updates. If you'd like to run it completely locally instead, create a bookmarklet with the contents of [standalone](https://github.com/kevlened/foodmarklet/blob/master/standalone).

## Troubleshooting

If you have trouble with a recipe:
1. Ensure you have the latest version.
2. File an issue or submit a PR.