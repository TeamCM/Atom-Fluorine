# Atom Processor MkII: Stacks

Stacks (in many other processors) is mainly used on functions, from CALL/RET instructions, to make AND,OR,NOT,XOR operations without LD/ST instructions, etc.

## BSP and SPO: {#bsp-and-spo}
BSP (Base Stack Pointer): unsigned constant integer, 0x0400

SPO (Stack Pointer Offset): 8-bit register, by default holds 0xFF (255).

## Push:
When the processor needs to push something to the stack, the processor will:
1. Add SPO and BSP which result in the address where the value will be written.
2. Decrement SPO by 1.
```c
// #define BSP 0x0400
// uint_8t memory[0xFFFF]; // example memory array
// uint_8t SPO;
void push(uint_8t value){
    memory[BSP + SPO] = value;
    SPO--;
}
```

## Pop:
When the processor needs to pop something from stack, the processor will:
1. Increment SPO by 1, 
2. Add SPO with BSP which result in the address where the value will be read.
```c
// #define BSP 0x0400
// uint_8t memory[0xFFFF]; // example memory array
// uint_8t SPO;
uint_8t pop(){
    SPO++;
    return memory[BSP + SPO];
}
```