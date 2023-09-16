# Atom Processor MkII: Stacks

Stacks (in many other processors) is what makes the CALL/RET instructions work, in other words, stack is what makes functions work.
Here on the Atom processor they serve the same functionality, but they only can hold 8-bit values.

## Glossary:
BSP (Base Stack Pointer): unsigned constant integer, 0x0400
SPO (Stack Pointer Offset): 8-bit register, by default holds 0xFF.

These two things will be used a lot on this paper.
Now that you have the familiarity with this two things, let's go see how push and pop work.

## Push:
When the processor needs to push something to the stack, the processor will sum the value of SPO and BSP which result in the address where the value will be written.
After that the SPO will be decremented by 1.

## Pop:
When the processor needs to pop something from stack, the processor will increment SPO by 1, sum the new value of SPO with BPO and then read the value stored in the memory from that sum.