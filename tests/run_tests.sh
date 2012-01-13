FAILS=0
for i in tests/test-*.js; do
  echo $i
  node $i || let FAILS++
  echo "------"
done
echo "\n$FAILS tests failed"
