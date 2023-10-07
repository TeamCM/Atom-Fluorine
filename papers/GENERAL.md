# Atom Processor MkII: General

## Resetting the processor {#resetting}
To reset the processor to it's default value, first set AC, XR, YR to 0, disable all flags and only set interrupt flag to true, set SPO to 0xFF and finally finish it setting IP to 0x800.
C code:
```c
// uint8_t AC; Accumulator
// uint8_t XR; X register
// uint8_t YR; Y register
// uint8_t STATUS; Status register
// uint16_t IP; Instruction pointer
AC = 0;
XR = 0;
YR = 0;
STATUS = 1 << 2;
SPO = 0xFF;
IP = 0x800;
```

## Interrupts: {#interrupts}
Every interrupt in the processor can be:
1. Non-maskable interrupts (NMI): which means they CANNOT BE ignored; They will trigger at location 0x806
1. Maskable interrupts (MI): which means they CAN BE ignored, by setting interrupt flag to false. They will trigger at location 0x803

Maskable interrupts are ignored if the 'interrupt' flag is not set.
### Interrupt process:
Whenever a NMI or MI was triggered the processor will do:
1. If the interrupt is a MI type, check the interrupt flag, otherwise if the interrupt is a NMI type, skip this step
    - Case 1: Interrupt flag is false
        - Ignore the request
    - Case 2: Interrupt flag is true, continues
2. The processor will push the high byte of the IP into the stack
3. The processor will push the low byte of the IP into the stack
4. The processor will push AC,XR,YR,STATUS (in this order, left to right order) to the stack
5. The processor will write the AC register with the specified argument of the interrupt and jump to the interrupt address (which will be dependent from the interrupt type).
C code:
```c
// This code is targeted to be simple, please do not send PR to improve this code.
// Considering these types.
// uint8_t AC; Accumulator
// uint8_t XR; X register
// uint8_t YR; Y register
// uint16_t IP; Instruction pointer
// bool isNMI; Is non maskable interrupt
// uint8_t STATUS; Status register
// uint8_t arg; Interrupt argument

if(!isNMI){
    if((status & (1 << 2)) == 0) return;
}
push(IP & 0xFF00);
push(IP & 0x00FF);
push(AC);
push(XR);
push(YR);
push(STATUS);
AC = arg;
if(isNMI){
    IP = 0x0806;
}else{
    IP = 0x803;
}
// ...processor continues...
```

### Returning from interrupt:
1. Pops STATUS,YR,XR,AC (in this order, left to right order) from the stack
2. Pops the low byte of the IP from the stack
3. Pops the high byte of the IP from the stack
4. Writes IP with the high and low byte.
```c
// This code is targeted to be simple, please do not send PR to improve this code.
// Considering these types.
// uint8_t AC; Accumulator
// uint8_t XR; X register
// uint8_t YR; Y register
// uint16_t IP; Instruction pointer
// uint8_t STATUS; Status register

STATUS = pop();
YR = pop();
XR = pop();
AC = pop();
uint16_t stack_ip;
stack_ip = pop();
stack_ip = pop() << 8;
IP = stack_ip;
```


## Operations:
### Addition: {#add-op}
The addition in the Atom Fluorine is done with 8-bit values only, so this means.
If the result is greather than 255. We subtACt 255 from the result and set carry flag to true.
Given a 8-bit unsigned integer N (number). This formula or C code is used:
```c
uint_8t r = (uint8_t)AC + N + (bool)ci;
bool co = ((uint8_t)AC + N) > 255;
bool zf = r == 0; // zero flag respect 8-bit ranges.
```
as `AC` being the value of AC register, `ci` as being the carry flag before the operation or 'carry in', `r` being the result in 8-bit range, `co` being the calculated carry flag or 'carry out' and `zf` as the calculated zero flag.

### Subtraction: {#sub-op}
Subtraction in the Atom Fluorine is a basically addition but with the number N inverted (xor with 255) and carry in and out inverted.
Given a 8-bit unsigned integer N. (number) This formula or C code is used:
```c
uint_8t r = (uint8_t)AC + (N ^ 255) + !(bool)ci;
bool co = ((uint8_t)AC + N) <= 255;
bool zf = r == 0; // zero flag respect 8-bit ranges.
```
as `AC` being the value of AC register, `ci` as being the carry flag before the operation or 'carry in', `r` being the result in 8-bit range, `co` being the calculated carry flag or 'carry out' and `zf` as the calculated zero flag.

### NAND: {#nand-op}
To reduce instructions, NAND is chosen to replace OR, AND, NOT and XOR because it can build all of these 4 gates with couple instructions.
Given a 8-bit unsigned integer N (number). This formula or C code is used:
```c
uint_8t r = ((uint8_t)AC & N) ^ 255;
bool zf = r == 0; // zero flag respect 8-bit ranges.
```
as `AC` being the value of AC register, `r` being the result in 8-bit range and `zf` as the calculated zero flag.

### Comparation (CMP): {cmp-op}
Compare is literally subtACtion but without setting AC with the calculated result.
Assembly a-like:
```asm
pusha
suN
popa
```
As `N` being replaced with `a`,`x` or `y`
Given a 8-bit unsigned integer Cn (compared value). This formula or C code is used:
```c
bool co = ((uint8_t)AC + N) <= 255;
bool zf = r == 0; // zero flag respect 8-bit ranges.
```
as `AC` being the value of AC register, `co` being the calculated carry flag or 'carry out' and `zf` as the calculated zero flag.