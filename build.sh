#!/bin/bash
# 在專案根目錄執行：bash build.sh  → 產生 index.html（單一檔案，可直接開啟、放 GitHub Pages 或發布）
cd "$(dirname "$0")"
S=src
cat $S/part3a.js > $S/part3.js; echo >> $S/part3.js; cat $S/part3b.js $S/part3c.js >> $S/part3.js
JS=""; for f in part2 part2e part3 part3z part4 part5 part7 part8a part8b part9 part10 part11 part12 part13 part14 part15; do JS="$JS $S/$f.js"; done
(echo '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'; cat $S/part1.html; echo '<script src="config.js"></script><script>'; cat vendor/GLTFLoader.js vendor/SkeletonUtils.js vendor/herodata.js; echo '</script><script>'; cat $JS; echo '</script></html>') > index.html
cat $JS > all.js
node --check all.js && echo "built: index.html"
