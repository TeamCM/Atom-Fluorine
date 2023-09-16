# Atom Processor MkII: Extras

## Resetting the processor {#resetting}
To reset the processor to it's default value, first set AC, XR, YR to 0, disable all flags and only set interrupt flag to true, and finish it setting SPO to 0xFF.

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

### Returning from interrupt:
1. Pops STATUS,YR,XR,AC (in this order, left to right order) from the stack
2. Pops the low byte of the IP from the stack
3. Pops the high byte of the IP from the stack
4. Writes IP with the high and low byte.