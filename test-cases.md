# 🧪 Complexity Analyzer Test Cases

## **Hidden Cost Examples** (Common AI Mistakes)

### 1. **String Slicing Recursion** → Expected: O(n²)
```python
def reverse_string(s):
    if len(s) <= 1:
        return s
    return reverse_string(s[1:]) + s[0]
```
**Why O(n²)**: n calls × O(k) slicing per call

### 2. **List Concatenation in Loop** → Expected: O(n²)  
```python
def create_lists(n):
    result = []
    for i in range(n):
        result = result + [i]  # O(k) concatenation each time
    return result
```
**Why O(n²)**: n iterations × O(k) list copying per iteration

### 3. **Nested String Operations** → Expected: O(n³)
```python
def process_strings(strings):
    result = ""
    for s in strings:  # O(n)
        for char in s:  # O(m) 
            result += char  # O(len(result)) string concat
    return result
```
**Why O(n³)**: Nested loops with growing string concatenation

## **Correct Simple Cases**

### 4. **Simple Linear** → Expected: O(n)
```python
def sum_array(arr):
    total = 0
    for num in arr:
        total += num
    return total
```

### 5. **Binary Search** → Expected: O(log n)
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

### 6. **Two Nested Loops** → Expected: O(n²)
```python
def find_pairs(arr):
    pairs = []
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):
            pairs.append((arr[i], arr[j]))
    return pairs
```

## **Tricky Recursion Cases**

### 7. **Fibonacci (Naive)** → Expected: O(2^n)
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

### 8. **Tree Traversal** → Expected: O(n)
```python
def count_nodes(root):
    if not root:
        return 0
    return 1 + count_nodes(root.left) + count_nodes(root.right)
```

### 9. **Merge Sort** → Expected: O(n log n)
```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)
```

## **Space Complexity Tests**

### 10. **In-Place Algorithm** → Expected: O(1) space
```python
def reverse_array(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
```

### 11. **Recursive with Stack** → Expected: O(n) space
```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
```

## **JavaScript Test Cases**

### 12. **Array Methods Chain** → Expected: O(n)
```javascript
function processArray(arr) {
    return arr
        .filter(x => x > 0)
        .map(x => x * 2)
        .reduce((sum, x) => sum + x, 0);
}
```

### 13. **Nested Object Search** → Expected: O(n²)
```javascript
function findInNestedArray(matrix, target) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] === target) {
                return [i, j];
            }
        }
    }
    return [-1, -1];
}
```

### 14. **String Building in Loop** → Expected: O(n²)
```javascript
function buildString(n) {
    let result = "";
    for (let i = 0; i < n; i++) {
        result += "a";  // String concatenation in JS
    }
    return result;
}
```

## **Edge Cases**

### 15. **Empty/Single Element** → Expected: O(1)
```python
def process_single(arr):
    if len(arr) <= 1:
        return arr[0] if arr else None
    return arr[0]
```

### 16. **Constant Work with Large Input** → Expected: O(1)
```python
def get_first_three(arr):
    return arr[:3] if len(arr) >= 3 else arr
```

## **Testing Strategy**

1. **Test Hidden Costs**: Cases 1-3 should catch if AI misses O(k) operations
2. **Test Basic Patterns**: Cases 4-6 verify standard complexity recognition  
3. **Test Recursion**: Cases 7-9 check recursive analysis
4. **Test Space Analysis**: Cases 10-11 verify space complexity
5. **Test Language Specific**: Cases 12-14 for JavaScript nuances
6. **Test Edge Cases**: Cases 15-16 for boundary conditions

## **Expected Results Summary**

| Test | Expected Time | Expected Space | Key Challenge |
|------|--------------|----------------|---------------|
| 1 | O(n²) | O(n²) | String slicing cost |
| 2 | O(n²) | O(n²) | List concatenation cost |  
| 3 | O(n³) | O(n²) | Nested + growing concat |
| 7 | O(2^n) | O(n) | Exponential recursion |
| 9 | O(n log n) | O(n) | Divide & conquer |
| 14 | O(n²) | O(n) | JS string immutability |

Use these to verify the AI correctly identifies hidden costs and doesn't just pattern match!