#!/bin/bash
# 建置並產生測試頁（把 CDN 的 three.js 換成本機 tests/three.min.js）
cd "$(dirname "$0")/.." && bash build.sh && sed 's#https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js#three.min.js#; s#<title>#<meta charset="utf-8"><title>#' index.html > tests/test.html
