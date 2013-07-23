var questions = [
    {"specs":{"findA":{"contains":["find2"],"intersects":["findB"],"text":"findA(item, list)\n@requires: list is an array with no\nduplicates\n@effects: returns the index of item in listor -1 if item does not exist","color":"rgba(0,255,255,0.3)"},"findB":{"contains":["find2"],"intersects":["findA"],"text":"findB(item, list)\n@requires: list is an array containing at\nleast one instance of item\n@effects: returns the index of the first\noccurrence of item in list","color":"rgba(0,100,0,0.3)"},"findC":{"contains":["find1"],"intersects":[],"text":"findC(item, list)\n@requires: list is an array\n@effects: returns true if list contains\nitem, false if it does not","color":"rgba(255,0,0,0.3)"}},"impls":{"find1":{"text":"function find1(item, list) {\n     return list.indexOf(item) >= 0;\n}","color":"rgba(0,255,0,1)"},"find2":{"text":"function find2(item, list) {\n     return list.indexOf(item);\n}","color":"rgba(0,0,139,1)"}}}, {"specs":{"minA":{"contains":["min1","min3"],"intersects":["minB"],"text":"minA(list)\n@requires: list is an array of positive\nnumbers with at least one element\n@effects: returns the smallest element in\nlist","color":"rgba(0,255,255,0.3)"},"minB":{"contains":["min2","min3"],"intersects":["minA"],"text":"minB(list)\n@requires: list is an array of numbers in\nincreasing order\n@effects: returns the smallest element in\nlist, or returns -Infinity if the list is\nempty","color":"rgba(255,0,255,0.3)"}},"impls":{"min1":{"text":"function min1(list) {\n  var min = 0;\n  for (var i = 0; i < list.length; ++i) {\n    if (list[i] < min) min = list[i];\n  }\n  return min;\n}","color":"rgba(0,100,0,1)"},"min2":{"text":"function min2(list) {\n  if (list.length == 0) return -Infinity;\n  else return list[0];\n}","color":"rgba(128,0,128,1)"},"min3":{"text":"function min3(list) {\n  return Math.min(list);\n}","color":"rgba(128,128,0,1)"}}}, {"specs":{"addA":{"contains":["add1","add3"],"intersects":[],"text":"/**\n * Adds elements of list2 to the end of\n * list1\n * @param list1 non-null\n * @param list2 non-null, different\n * from list1\n * @returns boolean indicating if list1\n * changed\n */\nstatic boolean addA (List<T> list1,\n                     List<T> list2)","color":"rgba(0,0,139,0.3)"}},"impls":{"add1":{"text":"static boolean add1 (List<T> list1,\n                     List<T> list2) {\n     var added = false;\n     for(T item : list2)\n     {\n          if(list1.add(item))\n               added = true;\n     }\n     return added;\n}","color":"rgba(255,255,0,1)"},"add2":{"text":"static boolean add2 (List<T> list1,\n                     List<T> list2) {\n     for(T item : list2)\n     {\n          if(list1.add(item))\n               return true;\n     }\n     return false;\n}","color":"rgba(0,100,0,1)"},"add3":{"text":"static boolean add3 (List<T> list1,\n                     List<T> list2) {\n     var origSize = list1.size();\n     for(T item : list2)\n     {\n          list1.add(item);\n     }\n     return origSize != list1.size();\n}","color":"rgba(255,0,255,1)"}}}
];