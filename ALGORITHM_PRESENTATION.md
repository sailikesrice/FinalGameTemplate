# Math Dungeon - Complete Algorithm Documentation
## PowerPoint Presentation Guide

---

## 📊 POWERPOINT PRESENTATION FLOW

### Suggested Slide Structure (20-25 slides)

#### **Section 1: Introduction (3 slides)**
1. **Title Slide**: Math Dungeon - Educational Game Algorithms
2. **Project Overview**: Brief description of the game and its educational purpose
3. **Algorithm Overview**: List of all 8 major algorithms covered

#### **Section 2: Core Algorithms (12-15 slides)**
4. **Map Generation Algorithm** - Overview + Diagram
5. **Map Generation Algorithm** - Example Walkthrough
6. **Puzzle Generation Algorithm** - Overview + Difficulty Scaling Table
7. **Puzzle Generation Algorithm** - Examples at Different Difficulties
8. **Puzzle Evaluation Algorithm** - Flowchart + Examples
9. **Difficulty Adjustment Algorithm** - Scoring System
10. **Difficulty Adjustment Algorithm** - Performance Examples
11. **Point Calculation Algorithm** - Formula Breakdown
12. **Point Calculation Algorithm** - Scoring Examples
13. **Room Building Algorithm** - Asset Placement Logic
14. **Player Movement Algorithm** - Collision Detection
15. **Tile Drag & Drop Algorithm** - Interaction Flow

#### **Section 3: System Integration (3-4 slides)**
16. **Algorithm Complexity Comparison** - Table
17. **System Architecture** - How Algorithms Work Together
18. **Real-Time Session Management** - Firebase Integration
19. **Performance Metrics** - Efficiency Analysis

#### **Section 4: Results & Conclusion (3 slides)**
20. **Educational Impact** - How Algorithms Support Learning
21. **Technical Achievements** - Key Features
22. **Future Enhancements** - Potential Improvements
23. **Q&A Slide**

---

# 🎮 ALGORITHM CATALOG

## 1. MAP GENERATION ALGORITHM

### **Purpose**
Creates a connected dungeon layout with a specified number of rooms using a random walk algorithm.

### **Algorithm Type**
**Random Walk / Procedural Generation**

### **Complexity**
- **Time**: O(n) where n = number of rooms
- **Space**: O(n)

### **Visual Representation**

```
┌─────────────────────────────────────┐
│  MAP GENERATION RANDOM WALK         │
└─────────────────────────────────────┘

Step 1: Start at (0,0)
   ●

Step 2: Pick random direction (East)
   ●─→●

Step 3: Pick random direction (South)
   ●─→●
       │
       ↓
       ●

Step 4: Pick random direction (East)
   ●─→●
       │
       ↓
       ●─→●

Step 5: Continue until 6 rooms generated
   ●─→●
       │
       ↓
       ●─→●─→●
           │
           ↓
           ●

Final Result: Connected dungeon layout
```

### **Detailed Flowchart**

```
START
  ↓
Create empty Set for room coordinates
  ↓
Add starting room (0, 0) to Set
  ↓
Set current position = (0, 0)
  ↓
┌─────────────────────────┐
│ LOOP: While Set.size <  │
│ ROOMS_PER_LEVEL         │
└─────────────────────────┘
  ↓
Pick random direction:
  - North (0, -1)
  - South (0, 1)
  - East (1, 0)
  - West (-1, 0)
  ↓
Calculate next position:
  next.x = current.x + direction.x
  next.y = current.y + direction.y
  ↓
Add next position to Set
(Set automatically handles duplicates)
  ↓
Update current = next
  ↓
Go back to LOOP
  ↓
Convert Set to Array
  ↓
Return Array of {x, y} coordinates
  ↓
END
```

### **Key Features**
- ✅ Guaranteed connectivity (all rooms reachable)
- ✅ Handles duplicates automatically (Set data structure)
- ✅ Compact and efficient
- ✅ Creates organic, non-linear layouts

### **Example Output**
```javascript
[
  { x: 0, y: 0 },   // Spawn room
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 2, y: 2 },
  { x: 3, y: 2 }    // Goal room
]
```

---

## 2. PUZZLE GENERATION ALGORITHM

### **Purpose**
Generates random math equations that scale in difficulty based on player performance.

### **Algorithm Type**
**Dynamic Content Generation with Adaptive Difficulty**

### **Complexity**
- **Time**: O(1)
- **Space**: O(1)

### **Difficulty Scaling Formula**

| Operation | Formula | Example (Difficulty 1) | Example (Difficulty 3) |
|-----------|---------|------------------------|------------------------|
| **Addition (+)** | `maxValue = 9 + (difficulty - 1) × 5` | 1-9 + 1-9 | 1-19 + 1-19 |
| **Subtraction (-)** | `maxValue = 15 + (difficulty - 1) × 10` | 5-15 - 1-15 | 5-35 - 1-35 |
| **Multiplication (×)** | `maxValue = 5 + (difficulty - 1) × 3` | 2-5 × 2-5 | 2-11 × 2-11 |
| **Division (÷)** | `maxValue = 5 + (difficulty - 1) × 3` | 2-5 ÷ 2-5 (clean) | 2-11 ÷ 2-11 (clean) |

### **Visual Flow Diagram**

```
┌─────────────────────────────────────┐
│  PUZZLE GENERATION PROCESS          │
└─────────────────────────────────────┘

[Start] → Get allowed operations (+, -, ×, ÷)
            ↓
          Pick random operation
            ↓
    ┌───────┴────────┬─────────┬──────────┐
    ↓                ↓         ↓          ↓
[Addition]    [Subtraction] [Multiply] [Division]
    ↓                ↓         ↓          ↓
maxAdd=9+(d-1)×5  maxSub=15  maxMult=5  maxDiv=5
    ↓            +(d-1)×10   +(d-1)×3   +(d-1)×3
    ↓                ↓         ↓          ↓
a=random(1,max)  a=random(5,  a=random   b=random
b=random(1,max)    max)       (2,max)    (2,max)
result=a+b       b=random(1,a) b=random  result=random
                 result=a-b   (2,max)    (2,max)
                              result=a×b  a=b×result
                                         result=a÷b
    ↓                ↓         ↓          ↓
    └────────────────┴─────────┴──────────┘
                     ↓
         Create equation string
         "a op b = result"
                     ↓
         Split into tokens
         ["a", "op", "b", "=", "result"]
                     ↓
         Shuffle tokens (except "=")
                     ↓
                  [Return]
```

### **Concrete Examples**

#### **Difficulty Level 1 (Beginner)**
```
Addition:       3 + 5 = 8     (range: 1-9)
Subtraction:    12 - 7 = 5    (range: 5-15)
Multiplication: 3 × 4 = 12    (range: 2-5)
Division:       10 ÷ 2 = 5    (range: 2-5, clean division)
```

#### **Difficulty Level 3 (Advanced)**
```
Addition:       17 + 14 = 31  (range: 1-19)
Subtraction:    28 - 13 = 15  (range: 5-35)
Multiplication: 9 × 8 = 72    (range: 2-11)
Division:       63 ÷ 9 = 7    (range: 2-11, clean division)
```

### **Key Features**
- ✅ Progressive difficulty scaling
- ✅ Always produces valid equations
- ✅ Division guarantees no remainders
- ✅ Customizable operation selection

---

## 3. PUZZLE EVALUATION ALGORITHM

### **Purpose**
Validates if the current arrangement of puzzle tiles forms a correct equation.

### **Algorithm Type**
**Token Parsing and Validation**

### **Complexity**
- **Time**: O(n) where n = number of tokens
- **Space**: O(n)

### **Validation Flow**

```
┌─────────────────────────────────────────────┐
│  PUZZLE EVALUATION DECISION TREE            │
└─────────────────────────────────────────────┘

Input: ["3", "+", "2", "=", "5"]
    ↓
Find "=" token
    ↓
  Found? ────NO────→ [INVALID]
    ↓ YES
Split into left and right
  left = ["3", "+", "2"]
  right = ["5"]
    ↓
Right has tokens? ──NO──→ [INVALID]
    ↓ YES
Parse right as number
  rightNum = 5
    ↓
Is valid number? ──NO──→ [INVALID]
    ↓ YES
Left has 3 tokens? ─NO──→ [INVALID]
    ↓ YES
Parse left tokens:
  a = parseFloat(left[0]) → 3
  op = left[1] → "+"
  b = parseFloat(left[2]) → 2
    ↓
Are a and b valid? ─NO──→ [INVALID]
    ↓ YES
Evaluate operation:
  ┌─────┬─────┬─────┬─────┐
  │  +  │  -  │  ×  │  ÷  │
  └─────┴─────┴─────┴─────┘
    ↓     ↓     ↓     ↓
  a+b   a-b   a×b  a÷b (b≠0)
    ↓     ↓     ↓     ↓
    └─────┴─────┴─────┘
            ↓
  Result == rightNum?
    ↓ YES        ↓ NO
  [VALID]    [INVALID]
```

### **Test Cases Table**

| Input Tokens | Expected | Actual Result | Valid? |
|--------------|----------|---------------|--------|
| `["3", "+", "2", "=", "5"]` | 5 | 3 + 2 = 5 | ✅ YES |
| `["3", "+", "2", "=", "6"]` | 6 | 3 + 2 = 5 | ❌ NO |
| `["8", "-", "3", "=", "5"]` | 5 | 8 - 3 = 5 | ✅ YES |
| `["4", "×", "5", "=", "20"]` | 20 | 4 × 5 = 20 | ✅ YES |
| `["12", "÷", "3", "=", "4"]` | 4 | 12 ÷ 3 = 4 | ✅ YES |
| `["12", "÷", "0", "=", "0"]` | 0 | Division by zero | ❌ NO |
| `["3", "+", "=", "5"]` | - | Missing operand | ❌ NO |
| `["3", "2", "+", "=", "5"]` | - | Invalid format | ❌ NO |

### **Key Features**
- ✅ Handles all four operations
- ✅ Prevents division by zero
- ✅ Validates token structure
- ✅ Type-safe number parsing

---

## 4. DIFFICULTY ADJUSTMENT ALGORITHM

### **Purpose**
Dynamically adjusts game difficulty based on player performance (speed and accuracy).

### **Algorithm Type**
**Adaptive Difficulty / Performance-Based Scaling**

### **Complexity**
- **Time**: O(1)
- **Space**: O(1)

### **Scoring System Breakdown**

```
┌─────────────────────────────────────────────┐
│  PERFORMANCE SCORING SYSTEM                 │
└─────────────────────────────────────────────┘

[Player Performance Data]
  - Time Taken (seconds)
  - Correct Answers
  - Total Questions
        ↓
┌───────────────────────────────┐
│ STEP 1: Calculate Time Score  │
└───────────────────────────────┘
  ≤ 120s → timeScore = 2  (⚡ Fast)
  ≤ 300s → timeScore = 1  (👍 Good)
  > 300s → timeScore = 0  (🐌 Slow)
        ↓
┌───────────────────────────────┐
│ STEP 2: Calculate Accuracy    │
└───────────────────────────────┘
  accuracy = correct / total
  ≥ 90% → accuracyScore = 2  (🎯 Excellent)
  ≥ 75% → accuracyScore = 1  (✓ Good)
  < 75% → accuracyScore = 0  (⚠ Needs Work)
        ↓
┌───────────────────────────────┐
│ STEP 3: Performance Score     │
└───────────────────────────────┘
  performanceScore = timeScore + accuracyScore
  Range: 0-4
        ↓
┌───────────────────────────────┐
│ STEP 4: Performance Rating    │
└───────────────────────────────┘
  perfScore ≥ 4 → rating = 2  (🌟 Master)
  perfScore ≥ 2 → rating = 1  (⭐ Proficient)
  perfScore < 2 → rating = 0  (💡 Learning)
        ↓
┌───────────────────────────────┐
│ STEP 5: Final Difficulty      │
└───────────────────────────────┘
  difficultyRating = levelNumber + performanceRating
  Cap at maximum of 4
        ↓
  [Next Level Difficulty]
```

### **Performance Examples**

| Scenario | Time | Accuracy | Time Score | Acc Score | Perf Score | Rating | Difficulty |
|----------|------|----------|------------|-----------|------------|--------|------------|
| **Speed Master** | 90s | 95% | 2 | 2 | 4 | 2 | Level+2 |
| **Balanced Pro** | 180s | 85% | 1 | 1 | 2 | 1 | Level+1 |
| **Methodical** | 400s | 92% | 0 | 2 | 2 | 1 | Level+1 |
| **Struggling** | 450s | 60% | 0 | 0 | 0 | 0 | Level+0 |
| **Quick but Careless** | 100s | 70% | 2 | 0 | 2 | 1 | Level+1 |

### **Visual Performance Matrix**

```
┌─────────────────────────────────────────────┐
│  PERFORMANCE SCORE MATRIX                   │
└─────────────────────────────────────────────┘

        Accuracy Score
        0    1    2
      ┌────┬────┬────┐
  0   │ 0  │ 1  │ 2  │
      ├────┼────┼────┤
T 1   │ 1  │ 2  │ 3  │
i     ├────┼────┼────┤
m 2   │ 2  │ 3  │ 4  │
e     └────┴────┴────┘

Performance Score → Rating:
  0-1 → Rating 0 (No increase)
  2-3 → Rating 1 (+1 difficulty)
  4   → Rating 2 (+2 difficulty)
```

### **Key Features**
- ✅ Balances speed and accuracy
- ✅ Prevents difficulty spikes
- ✅ Rewards both speed and precision
- ✅ Adaptive learning curve

---

## 5. POINT CALCULATION ALGORITHM

### **Purpose**
Calculates player score based on performance metrics for leaderboard ranking.

### **Algorithm Type**
**Multi-Factor Scoring System**

### **Complexity**
- **Time**: O(1)
- **Space**: O(1)

### **Formula Breakdown**

```
┌─────────────────────────────────────────────┐
│  POINT CALCULATION FORMULA                  │
└─────────────────────────────────────────────┘

TOTAL POINTS = BASE + TIME BONUS + ACCURACY BONUS + DIFFICULTY BONUS

┌────────────────────────────┐
│ BASE POINTS                │
│ = 500                      │
│ (Guaranteed minimum)       │
└────────────────────────────┘
        +
┌────────────────────────────┐
│ TIME BONUS                 │
│ = max(0, 300 - time/100)   │
│ (Faster = More points)     │
└────────────────────────────┘
        +
┌────────────────────────────┐
│ ACCURACY BONUS             │
│ = floor(accuracy × 2)      │
│ (Up to 200 points)         │
└────────────────────────────┘
        +
┌────────────────────────────┐
│ DIFFICULTY BONUS           │
│ = difficulty × 50          │
│ (Higher difficulty = More) │
└────────────────────────────┘
```

### **Scoring Examples**

| Time (ms) | Accuracy | Difficulty | Base | Time Bonus | Accuracy Bonus | Diff Bonus | **TOTAL** |
|-----------|----------|------------|------|------------|----------------|------------|-----------|
| 60,000 (1 min) | 100% | 3 | 500 | 300 - 600 = 0 | 100 × 2 = 200 | 3 × 50 = 150 | **850** |
| 30,000 (30s) | 95% | 2 | 500 | 300 - 300 = 0 | 95 × 2 = 190 | 2 × 50 = 100 | **790** |
| 15,000 (15s) | 90% | 1 | 500 | 300 - 150 = 150 | 90 × 2 = 180 | 1 × 50 = 50 | **880** |
| 90,000 (1.5 min) | 85% | 4 | 500 | 300 - 900 = 0 | 85 × 2 = 170 | 4 × 50 = 200 | **870** |
| 120,000 (2 min) | 70% | 1 | 500 | 0 | 70 × 2 = 140 | 1 × 50 = 50 | **690** |

### **Key Features**
- ✅ Minimum 100 points guaranteed
- ✅ Rewards both speed and accuracy
- ✅ Scales with difficulty
- ✅ Prevents negative scores

---

## 6. ROOM BUILDING ALGORITHM

### **Purpose**
Constructs individual rooms with walls, doors, floors, and puzzles based on neighboring rooms.

### **Algorithm Type**
**Grid-Based Asset Placement with Neighbor Detection**

### **Complexity**
- **Time**: O(n²) where n = room size (13×13)
- **Space**: O(n²)

### **Visual Room Structure**

```
┌─────────────────────────────────────────────┐
│  ROOM GRID (13×13 tiles)                    │
└─────────────────────────────────────────────┘

     0  1  2  3  4  5  6  7  8  9 10 11 12
  ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
0 │TL│TW│TW│TW│TW│TW│TD│TW│TW│TW│TW│TW│TR│  Top edge
  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤
1 │LW│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│RW│
2 │LW│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│RW│
3 │LW│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│RW│
4 │LW│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│RW│
5 │LW│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│RW│
6 │LD│FL│P1│P2│P3│P4│P5│P6│FL│FL│FL│FL│RD│  Center: Puzzle
7 │LW│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│RW│
8 │LW│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│RW│
9 │LW│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│RW│
10│LW│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│RW│
11│LW│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│FL│RW│
  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤
12│BL│BW│BW│BW│BW│BW│BD│BW│BW│BW│BW│BW│BR│  Bottom edge
  └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘

Legend:
TL/TR/BL/BR = Corner walls
TW/BW/LW/RW = Edge walls
TD/BD/LD/RD = Doors (if neighbor exists)
FL = Floor tile
P1-P6 = Puzzle tiles (shuffled equation)
```

### **Neighbor Detection Logic**

```
┌─────────────────────────────────────────────┐
│  DOOR PLACEMENT LOGIC                       │
└─────────────────────────────────────────────┘

Current Room: (x, y)
    ↓
Check 4 neighbors:
  - Top:    (x, y-1)
  - Bottom: (x, y+1)
  - Left:   (x-1, y)
  - Right:  (x+1, y)
    ↓
For each neighbor:
  ↓
Neighbor exists? ──NO──→ Place Wall (collidable)
  ↓ YES
Place Door (non-collidable, allows passage)
```

### **Asset Placement Rules**

| Tile Type | Condition | Asset | Collidable? |
|-----------|-----------|-------|-------------|
| **Corner** | (0,0), (0,12), (12,0), (12,12) | Corner wall | ✅ Yes |
| **Top Edge** | row=0, has top neighbor | Top door | ❌ No |
| **Top Edge** | row=0, no top neighbor | Top wall | ✅ Yes |
| **Bottom Edge** | row=12, has bottom neighbor | Bottom door | ❌ No |
| **Bottom Edge** | row=12, no bottom neighbor | Bottom wall | ✅ Yes |
| **Left Edge** | col=0, has left neighbor | Left door | ❌ No |
| **Left Edge** | col=0, no left neighbor | Left wall | ✅ Yes |
| **Right Edge** | col=12, has right neighbor | Right door | ❌ No |
| **Right Edge** | col=12, no right neighbor | Right wall | ✅ Yes |
| **Interior** | 1 ≤ row,col ≤ 11 | Floor | ❌ No |
| **Center Row** | row=6, 1 ≤ col ≤ 11 | Puzzle tiles | ❌ No |

---

## 7. PLAYER MOVEMENT & COLLISION ALGORITHM

### **Purpose**
Handles player movement with tile-based collision detection and room transitions.

### **Algorithm Type**
**Grid-Based Movement with Collision Detection**

### **Complexity**
- **Time**: O(1)
- **Space**: O(1)

### **Movement Flow**

```
┌─────────────────────────────────────────────┐
│  PLAYER MOVEMENT DECISION TREE              │
└─────────────────────────────────────────────┘

[Input: Arrow Key / WASD]
        ↓
  Is spawning? ──YES──→ [BLOCK MOVEMENT]
        ↓ NO
  Is moving? ──YES──→ [BLOCK MOVEMENT]
        ↓ NO
Calculate current tile position:
  localCol = round((player.x - offset) / TILE_SIZE)
  localRow = round((player.y - offset) / TILE_SIZE)
        ↓
Calculate target position:
  targetCol = localCol + dx
  targetRow = localRow + dy
        ↓
Update animation based on direction
        ↓
Is target at room edge? ──NO──→ Check if within bounds
        ↓ YES                      ↓ NO → [BLOCK]
Has neighbor in that direction?    ↓ YES
        ↓ YES          ↓ NO        Check collision with walls
[ROOM TRANSITION]  [BLOCK]         ↓ YES → [BLOCK]
        ↓                           ↓ NO
Calculate world position            Calculate world position
        ↓                           ↓
Start tween animation              Start tween animation
        ↓                           ↓
Set isMoving = true                Set isMoving = true
        ↓                           ↓
On complete: Play idle animation   On complete: Play idle
        ↓                           ↓
Set isMoving = false               Set isMoving = false
```

### **Animation State Machine**

```
┌─────────────────────────────────────────────┐
│  PLAYER ANIMATION STATES                    │
└─────────────────────────────────────────────┘

      [IDLE-LEFT]  ⟷  [IDLE-RIGHT]
           ↓                ↓
      [MOVE-LEFT]  ⟷  [MOVE-RIGHT]
           ↓                ↓
      When dx < 0      When dx > 0
           ↓                ↓
      [MOVE-UP-LEFT]   [MOVE-UP-RIGHT]
      [MOVE-DOWN-LEFT] [MOVE-DOWN-RIGHT]
           ↓                ↓
      When dy ≠ 0      When dy ≠ 0
```

---

## 8. TILE DRAG & DROP ALGORITHM

### **Purpose**
Enables smooth drag-and-drop interaction for puzzle tiles with snap-to-grid and tile swapping.

### **Algorithm Type**
**Interactive Input Handling with Grid Snapping**

### **Complexity**
- **Time**: O(1)
- **Space**: O(1)

### **Interaction Flow**

```
┌─────────────────────────────────────────────┐
│  DRAG & DROP INTERACTION FLOW               │
└─────────────────────────────────────────────┘

[User Touch/Click on Tile]
        ↓
Store offset:
  offsetX = tile.x - pointer.x
  offsetY = tile.y - pointer.y
        ↓
Set isDragging = true
Set depth = 100 (bring to front)
        ↓
[While Dragging]
        ↓
Update tile position:
  tile.x = pointer.x + offsetX
  tile.y = pointer.y + offsetY
        ↓
[User Releases]
        ↓
Calculate snapped column:
  snappedCol = round((tile.x - offset) / TILE_SIZE)
        ↓
Clamp to valid range:
  snappedCol = clamp(col, minCol, maxCol)
        ↓
Calculate snapped position:
  snappedX = offset + snappedCol × TILE_SIZE + TILE_SIZE/2
        ↓
Is position occupied? ──NO──→ Move tile to position
        ↓ YES                  └→ Animate tile
Swap tiles                        ↓
  └→ Get other tile              Emit 'puzzle-updated'
     Swap in tileMap                ↓
     Animate both tiles         Check solution
        ↓
  Emit 'puzzle-updated'
        ↓
  Check solution
```

### **Tile Swapping Example**

```
BEFORE SWAP:
Position: [1]    [2]    [3]    [4]    [5]
Tile:     "3"    "+"    "2"    "="    "5"
          ↑                            ↑
       Dragging                    Drop here

DURING SWAP:
  tileMap[1] = "5"  (was "3")
  tileMap[5] = "3"  (was "5")
  
  Animate "3" to position 5
  Animate "5" to position 1

AFTER SWAP:
Position: [1]    [2]    [3]    [4]    [5]
Tile:     "5"    "+"    "2"    "="    "3"
```

---

# 📊 ALGORITHM COMPARISON TABLE

## Complexity Summary

| Algorithm | Time Complexity | Space Complexity | Type | Primary Use |
|-----------|----------------|------------------|------|-------------|
| **Map Generation** | O(n) | O(n) | Procedural Generation | Create dungeon layout |
| **Puzzle Generation** | O(1) | O(1) | Random Generation | Create math problems |
| **Puzzle Evaluation** | O(n) | O(n) | Token Parsing | Validate solutions |
| **Difficulty Adjustment** | O(1) | O(1) | Scoring System | Adaptive difficulty |
| **Point Calculation** | O(1) | O(1) | Formula | Leaderboard ranking |
| **Room Building** | O(n²) | O(n²) | Grid Placement | Construct rooms |
| **Player Movement** | O(1) | O(1) | Input Handling | Control player |
| **Tile Drag & Drop** | O(1) | O(1) | Interaction | Puzzle UI |

*n = number of elements (rooms, tokens, tiles, etc.)*

---

# 🏗️ SYSTEM ARCHITECTURE

## How Algorithms Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                    GAME INITIALIZATION                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────┐
        │   MAP GENERATION ALGORITHM           │
        │   Creates dungeon layout             │
        └──────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────┐
        │   ROOM BUILDING ALGORITHM            │
        │   Builds each room with assets       │
        └──────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────┐
        │   PUZZLE GENERATION ALGORITHM        │
        │   Creates equations for each room    │
        │   (uses current difficulty rating)   │
        └──────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    GAMEPLAY LOOP                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────┐
        │   PLAYER MOVEMENT ALGORITHM          │
        │   Handles input and collision        │
        └──────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────┐
        │   TILE DRAG & DROP ALGORITHM         │
        │   Player interacts with puzzle       │
        └──────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────┐
        │   PUZZLE EVALUATION ALGORITHM        │
        │   Checks if equation is correct      │
        └──────────────────────────────────────┘
                            ↓
                  All rooms solved?
                      ↓ YES
┌─────────────────────────────────────────────────────────────┐
│                    LEVEL COMPLETE                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────┐
        │   DIFFICULTY ADJUSTMENT ALGORITHM    │
        │   Analyzes performance               │
        └──────────────────────────────────────┘
                            ↓
        ┌──────────────────────────────────────┐
        │   POINT CALCULATION ALGORITHM        │
        │   Computes final score               │
        └──────────────────────────────────────┘
                            ↓
            Update leaderboard → Next Level
```

---

# 🎯 EDUCATIONAL IMPACT

## How Algorithms Support Learning Goals

| Algorithm | Educational Benefit | Learning Outcome |
|-----------|-------------------|------------------|
| **Puzzle Generation** | Adaptive content delivery | Students practice at appropriate level |
| **Difficulty Adjustment** | Personalized learning path | Maintains engagement without frustration |
| **Point Calculation** | Performance feedback | Motivates improvement |
| **Tile Drag & Drop** | Interactive learning | Kinesthetic engagement |
| **Puzzle Evaluation** | Immediate feedback | Reinforces correct understanding |

---

# 📈 PERFORMANCE METRICS

## Algorithm Efficiency

```
EFFICIENCY BREAKDOWN BY ALGORITHM:

┌─────────────────────────────────────┐
│ Real-Time Algorithms (< 1ms)        │
├─────────────────────────────────────┤
│ ✓ Puzzle Generation                 │
│ ✓ Difficulty Adjustment             │
│ ✓ Point Calculation                 │
│ ✓ Player Movement                   │
│ ✓ Tile Drag & Drop                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Load-Time Algorithms (< 100ms)      │
├─────────────────────────────────────┤
│ ✓ Map Generation (6-10 rooms)       │
│ ✓ Room Building (per room)          │
│ ✓ Puzzle Evaluation (on submit)     │
└─────────────────────────────────────┘

Total Level Generation: ~50-150ms
(Acceptable for game loading screen)
```

---

# 🔮 FUTURE ENHANCEMENTS

## Potential Algorithm Improvements

1. **Map Generation**
   - Add procedural room themes
   - Implement branch and loop patterns
   - Add dead-end detection and removal

2. **Puzzle Generation**
   - Multi-step equations (e.g., "2 + 3 × 4 = ?")
   - Parentheses support
   - Variable-based equations

3. **Difficulty Adjustment**
   - Machine learning integration
   - Per-operation difficulty tracking
   - Long-term progress monitoring

4. **Point Calculation**
   - Combo multipliers for consecutive correct answers
   - Bonus for no-hint completions
   - Speed streaks

---

# 📚 REFERENCES & TOOLS

## Technologies Used

- **Game Engine**: Phaser 3 (JavaScript game framework)
- **Language**: JavaScript (ES6+)
- **Database**: Firebase Firestore (real-time data)
- **Hosting**: Vercel (automatic deployment)
- **Version Control**: Git/GitHub

## Key Design Patterns

1. **Singleton Pattern**: SessionManager, GameSettings
2. **Factory Pattern**: Room and Puzzle generation
3. **Observer Pattern**: Event-driven puzzle updates
4. **State Pattern**: Scene management
5. **Strategy Pattern**: Different operations in puzzles

---

# 💡 PRESENTATION TIPS

## Slide Design Recommendations

### Visual Hierarchy
1. **Title**: Large, bold, clear
2. **Main Content**: Diagrams and flowcharts
3. **Details**: Tables and code snippets
4. **Footer**: Slide numbers and section indicators

### Color Coding
- 🟦 **Blue**: Input/Start points
- 🟨 **Yellow**: Decision points
- 🟩 **Green**: Success/Output
- 🟥 **Red**: Failure/Block
- 🟪 **Purple**: Processing steps

### Animation Suggestions
- **Flow diagrams**: Animate step-by-step
- **Tables**: Reveal rows one at a time
- **Code**: Highlight key sections
- **Examples**: Show before/after comparisons

### Engagement Techniques
1. **Live Demo**: Show the game in action
2. **Interactive Poll**: "What difficulty would you get?"
3. **Code Walkthrough**: Pick 1-2 algorithms to explain in detail
4. **Q&A Preparation**: Anticipate technical questions

---

# ✅ PRESENTATION CHECKLIST

## Before Your Presentation

- [ ] Test all slides on presentation computer
- [ ] Verify game runs smoothly for live demo
- [ ] Prepare backup video recording of gameplay
- [ ] Print handout with algorithm summaries
- [ ] Practice timing (aim for 15-20 minutes)
- [ ] Prepare answers for common questions
- [ ] Test pointer/clicker
- [ ] Have code repository link ready

## During Presentation

- [ ] Speak clearly and at moderate pace
- [ ] Point to specific parts of diagrams
- [ ] Use concrete examples
- [ ] Invite questions at key points
- [ ] Monitor time
- [ ] Show enthusiasm!

---

**Document prepared for PowerPoint presentation**
**Game Version: 0.9.11**
**Last Updated: November 2025**

