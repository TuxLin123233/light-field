#!/bin/bash
# 批量截图：每页两种规格
SHOOT="/home/tux/编程/光域/.ui"
OUT="/home/tux/编程/光域/ui-shots"
shot() {  # name  path  W  H  scale
  local name="$1" to="$2" w="$3" h="$4" sc="$5"
  timeout 90 chromium --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --user-data-dir="$SHOOT/p-$name-$w" \
    --virtual-time-budget=8000 --force-device-scale-factor="$sc" \
    --window-size="$w,$h" \
    --screenshot="$OUT/$name.png" \
    "http://127.0.0.1:8791/__boot?to=$to" >/dev/null 2>&1
  if [ -f "$OUT/$name.png" ]; then
    python3 -c "
from PIL import Image
im = Image.open('$OUT/$name.png')
im.resize((im.width//$sc, im.height//$sc), Image.LANCZOS).save('$OUT/$name.1x.png')
print('  ✓ %-22s %d×%d' % ('$name', im.width, im.height))"
  else echo "  ✗ $name 失败"; fi
}
# 页面清单：编号 路径
PAGES="paint:/paint gallery:/gallery town:/town home:/town/home mine:/mine avatar:/avatar user:/u?uid=u1 changelog:/changelog"
for spec in "桌面 1440 900 2" "手机 390 844 3"; do
  set -- $spec
  LABEL="$1"; W="$2"; H="$3"; SC="$4"
  echo "=== $LABEL（${W}×${H} @${SC}x）==="
  for pg in $PAGES; do
    n="${pg%%:*}"; p="${pg#*:}"
    shot "${n}-${LABEL}" "$p" "$W" "$H" "$SC"
  done
done
