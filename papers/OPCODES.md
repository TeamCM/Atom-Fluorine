# Atom Processor MkII: Opcodes
- HLT (HaLT) (0x00): Sets the halted flag to true.
- NOP (No OPeration) (0x01): Does nothing
- LDA (LoaD to Accumulator) (0x02) \<address16>: Loads a absolute addressed value into register AC
- LDX (LoaD to X register) (0x03) \<address16>: Loads a absolute addressed value into XR
- LDY (LoaD to Y register) (0x04) \<address16>: Loads a absolute addressed value into YR
- LDIA (LoaD Immediate to Accumulator) (0x05) \<number8>: Loads a immediate value into register AC
- LDIX (LoaD Immediate to X register) (0x06) \<number8>: Loads a immediate value into XR
- LDIY (LoaD Immediate to Y register) (0x07) \<number8>: Loads a immediate value into YR
- STA (STore Accumulator) (0x08) \<address16>: Stores AC into the specified address
- STX (STore X register) (0x09) \<address16>: Stores XR into the specified address
- STY (STore Y register) (0x0A) \<address16>: Stores YR into the specified address
- ADA (ADd Accumulator) (0x0B): Makes a add[^1] operation with AX (itself, result always the double of AC).
- ADX (ADd X register) (0x0C): Makes a add[^1] operation with XR.
- ADY (ADd Y register) (0x0D): Makes a add[^1] operation with XR.
- SUA (SUbtract Accumulator) (0x0E): Makes a subtract[^2] operation with AC (itself, always zero).
- SUX (SUbtract X register) (0x0F): Makes a subtract[^2] operation with XR.
- SUY (SUbtract Y register) (0x10): Makes a subtract[^2] operation with YR.
- NANA (NANd Accumulator) (0x11): Makes a NAND[^3] operation with AC (itself, always the negative of AC).
- NANX (NANd X register) (0x12): Makes a NAND[^3] operation with XR.
- NANY (NANd Y register) (0x13): Makes a NAND[^3] operation with YR.
- PUSHA (PUSH Accumulator) (0x14): Push AC to stack
- PUSHX (PUSH X register) (0x15): Push XR to stack
- PUSHY (PUSH Y register) (0x16): Push YR to stack
- POPA (POP to Accumulator) (0x17): Pop a value from stack to AC
- POPX (POP to X register) (0x18): Pop a value from stack to XR
- POPY (POP to Y register) (0x19): Pop a value from stack to YR
- CMA (CoMpare Accumulator) (0x1A): Makes a compare[^4] operation with AC (itself, always zf=true).
- CMX (CoMpare X register) (0x1B): Makes a compare[^4] operation with XR.
- CMY (CoMpare Y register) (0x1C): Makes a compare[^4] operation with YR.
- JMP (JuMP to) (0x1D) \<address16>: Sets IP to the specified address
- JZ (Jump if Zero to) (0x1E) \<address16>: Sets IP to the specified address only if the zero flag is true (the processor still needs to read the address)
- JC (Jump if Carry to) (0x1F) \<address16>: Sets IP to the specified address only if the carry flag is true (the processor still needs to read the address)
- CALL (0x20) \<address16>: Reads a address, push the current IP high byte to the stack then push low byte to the stack and after that jumps to the specified address.
- RET (RETurn) (0x21): Pops the high byte address from the stack, then the low byte and then jumps to that address.
- INT (INTerrupt) (0x22) \<argument8>: Triggers a maskable interrupt with the specified argument. See [Extra: Interrupts](./EXTRA.md#interrupts)
- RETI (RETurn from Interrupt) (0x23) \<argument8>: Returns from a interrupt[^5].
- CZF (Clear Zero Flag) (0x24): Sets the zero flag to false
- CCF (Clear Carry Flag) (0x25): Sets the carry flag to false
- CIF (Clear Interrupt Flag) (0x26): Sets the interrupt flag to false
- SZF (Set Zero Flag) (0x27): Sets the zero flag to true
- SCF (Set Carry Flag) (0x28): Sets the carry flag to true
- SIF (Set Interrupt Flag) (0x29): Sets the interrupt flag to true
- RST (ReSeT) (0x2A): [Resets](./GENERAL.md#resetting-the-processor-resetting) the processor to it's default state
- Any other undefined opcode: Halts the processor.


[^1]: ./GENERAL.md#add-op
[^2]: ./GENERAL.md#sub-op
[^3]: ./GENERAL.md#nand-op
[^4]: ./GENERAL.md#cmp-op
[^5]: ./GENERAL.md#interrupts