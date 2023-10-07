# Atom Processor MkII: Registers

Registers is one of the fundamental part of the Atom processor, since they hold the data used by the instructions, here a list of them:

## Register AC
The register AC is the accumulator, holds a 8-bit value, every logical/arithmetic operation done on the processor will output to the AC register

## X Register (XR)
The 'X register' is a generic register, holds a 8-bit value, it is labeled a 'generic register' since they only serve to hold data which is used by the processor instructions.

## Y Register (YR)
The 'Y register' is a generic register as above.

## Flag Register (STATUS):
The 'Flag Register' or 'Status' register holds flags which in order that should look like this:
1 << 0: Zero (whenever a logical/arithmetic operation result is equal to zero, this flag should be activated)
1 << 1: Carry (whenever a arithmetic operation result is greather than 255, this flag is set to true)
1 << 2: Interrupt (toggles if maskable interrupts works, by default this is set to true)
1 << 3: Unused
1 << 4: Unused
1 << 5: Unused
1 << 6: Unused
1 << 7: Halted (if set, the processor will no longer execute instructions)
This register cannot be accessed directly using LD.../ST... instructions, instead it can be controlled using the S...F/C...F instruction group and HLT

## Stack Pointer Offset (SPO):
The 'Stack Pointer Offset' register holds a 8-bit value which by default is 255.
When the processor needs to push/pop a value, the address will be SPO + BPO.
See [stacks](./STACK.md#bsp-and-spo)

## Instruction Pointer (IP, normally called PC, Program Counter):
The 'Instruction Pointer' register holds a 16-bit value which by default is 0x800.
When the processor needs to fetch a opcode/operand the processor read a value in RAM using this address, after that the IP is incremented by 1
This register cannot be accesed directly using LD.../ST... instructions, instead it can be controlled using the JMP/JC/JZ instructions