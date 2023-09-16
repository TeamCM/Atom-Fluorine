const PROCESSOR_FLAGS = class {
    static ZERO = 1 << 0
    static CARRY = 1 << 1
    static INTERRUPT = 1 << 2
    static HALTED = 1 << 7
};
const STACK_OFFSET_ADDRESS = 0x200; // still only fits 255 items
const DEFAULT_ADDRESS = 0x800;
const MASKABLE_INTERRUPT_ADDRESS = 0x803;
const NON_MASKABLE_INTERRUPT_ADDRESS = 0x806;
const PROCESSOR_OPERATIONS = [ // the array itself is a instruction decoder, which can be triggered by PROCESSOR_OPERATIONS[INSTRUCTION](cpu)
    function HLT(cpu){
        cpu.setFlag(PROCESSOR_FLAGS.HALTED, true);
    },
    function NOP(cpu){},
    function LDA(cpu){
        cpu.registers[0] = cpu.readFrom(cpu.fetchAddress());
    },
    function LDX(cpu){
        cpu.registers[1] = cpu.readFrom(cpu.fetchAddress());
    },
    function LDY(cpu){
        cpu.registers[2] = cpu.readFrom(cpu.fetchAddress());
    },
    function LDIA(cpu){
        cpu.registers[0] = cpu.fetch();
    },
    function LDIX(cpu){
        cpu.registers[1] = cpu.fetch();
    },
    function LDIY(cpu){
        cpu.registers[2] = cpu.fetch();
    },
    function STA(cpu){
        cpu.writeTo(cpu.fetchAddress(), cpu.registers[0]);
    },
    function STX(cpu){
        cpu.writeTo(cpu.fetchAddress(), cpu.registers[1]);
    },
    function STY(cpu){
        cpu.writeTo(cpu.fetchAddress(), cpu.registers[2]);
    },
    function ADA(cpu){
        const operation = processor_add(cpu.registers[0], cpu.registers[0], cpu.getFlag(PROCESSOR_FLAGS.CARRY));
        cpu.registers[0] = operation.result;
        cpu.setFlag(PROCESSOR_FLAGS.CARRY, operation.cout);
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function ADX(cpu){
        const operation = processor_add(cpu.registers[0], cpu.registers[1], cpu.getFlag(PROCESSOR_FLAGS.CARRY));
        cpu.registers[0] = operation.result;
        cpu.setFlag(PROCESSOR_FLAGS.CARRY, operation.cout);
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function ADY(cpu){
        const operation = processor_add(cpu.registers[0], cpu.registers[2], cpu.getFlag(PROCESSOR_FLAGS.CARRY));
        cpu.registers[0] = operation.result;
        cpu.setFlag(PROCESSOR_FLAGS.CARRY, operation.cout);
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function SUA(cpu){
        const operation = processor_sub(cpu.registers[0], cpu.registers[0], cpu.getFlag(PROCESSOR_FLAGS.CARRY));
        cpu.registers[0] = operation.result;
        cpu.setFlag(PROCESSOR_FLAGS.CARRY, operation.cout);
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function SUX(cpu){
        const operation = processor_sub(cpu.registers[0], cpu.registers[1], cpu.getFlag(PROCESSOR_FLAGS.CARRY));
        cpu.registers[0] = operation.result;
        cpu.setFlag(PROCESSOR_FLAGS.CARRY, operation.cout);
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function SUY(cpu){
        const operation = processor_sub(cpu.registers[0], cpu.registers[2], cpu.getFlag(PROCESSOR_FLAGS.CARRY));
        cpu.registers[0] = operation.result;
        cpu.setFlag(PROCESSOR_FLAGS.CARRY, operation.cout);
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function NANA(cpu){
        const operation = processor_nand(cpu.registers[0], cpu.registers[0]);
        cpu.registers[0] = operation.result;
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function NANX(cpu){
        const operation = processor_nand(cpu.registers[0], cpu.registers[1]);
        cpu.registers[0] = operation.result;
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function NANY(cpu){
        const operation = processor_nand(cpu.registers[0], cpu.registers[2]);
        cpu.registers[0] = operation.result;
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function PUSHA(cpu){
        cpu.push(cpu.registers[0]);
    },
    function PUSHX(cpu){
        cpu.push(cpu.registers[1]);
    },
    function PUSHY(cpu){
        cpu.push(cpu.registers[2]);
    },
    function POPA(cpu){
        cpu.registers[0] = cpu.pop();
    },
    function POPX(cpu){
        cpu.registers[1] = cpu.pop();
    },
    function POPY(cpu){
        cpu.registers[2] = cpu.pop();
    },
    function CMA(cpu){
        const operation = processor_sub(cpu.registers[0], cpu.registers[0], cpu.getFlag(PROCESSOR_FLAGS.CARRY));
        cpu.setFlag(PROCESSOR_FLAGS.CARRY, operation.cout);
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function CMX(cpu){
        const operation = processor_sub(cpu.registers[0], cpu.registers[1], cpu.getFlag(PROCESSOR_FLAGS.CARRY));
        cpu.setFlag(PROCESSOR_FLAGS.CARRY, operation.cout);
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function CMY(cpu){
        const operation = processor_sub(cpu.registers[0], cpu.registers[2], cpu.getFlag(PROCESSOR_FLAGS.CARRY));
        cpu.setFlag(PROCESSOR_FLAGS.CARRY, operation.cout);
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, operation.zero);
    },
    function JMP(cpu){
        cpu.ip = cpu.fetchAddress();
    },
    function JZ(cpu){
        const address = cpu.fetchAddress();
        if(cpu.getFlag(PROCESSOR_FLAGS.ZERO)){
            cpu.ip = address;
        }
    },
    function JC(cpu){
        const address = cpu.fetchAddress();
        if(cpu.getFlag(PROCESSOR_FLAGS.CARRY)){
            cpu.ip = address;
        }
    },
    function CALL(cpu){
        const address = cpu.fetchAddress();
        const ip_section = (cpu.ip & 0xFF00) >> 8;
        const ip_index = cpu.ip & 0x00FF;
        cpu.push(ip_section);
        cpu.push(ip_index);
        cpu.ip = address;
    },
    function RET(cpu){
        const ip_index = cpu.pop();
        const ip_section = cpu.pop();
        cpu.ip = (ip_section << 8) | ip_index;
    },
    function INT(cpu){
        const arg1 = cpu.fetch();
        cpu.maskable_interrupt(arg1);
    },
    function RETI(cpu){
        const special = cpu.pop();
        const registerY = cpu.pop();
        const registerX = cpu.pop();
        const registerA = cpu.pop();
        const ip_index = cpu.pop();
        const ip_section = cpu.pop();
        cpu.ip = (ip_section << 8) | ip_index;
        cpu.registers[0] = registerA;
        cpu.registers[1] = registerX;
        cpu.registers[2] = registerY;
        cpu.registers[4] = special;
    },
    function CZF(cpu){
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, false);
    },
    function CCF(cpu){
        cpu.setFlag(PROCESSOR_FLAGS.CARRY, false);
    },
    function CIF(cpu){
        cpu.setFlag(PROCESSOR_FLAGS.INTERRUPT, false);
    },
    function SZF(cpu){
        cpu.setFlag(PROCESSOR_FLAGS.ZERO, true);
    },
    function SCF(cpu){
        cpu.setFlag(PROCESSOR_FLAGS.CARRY, true);
    },
    function SIF(cpu){
        cpu.setFlag(PROCESSOR_FLAGS.INTERRUPT, true);
    },
    function RST(cpu){
        cpu.reset();
    }
];

// Special addition
function processor_add(v1, v2, cin = false){
    const result = v1 + v2 + cin;
    return {
        result: result & 0xFF,
        cout: result > 0xFF,
        zero: (result & 0xFF) === 0
    }
}
// Special subtraction
function processor_sub(v1, v2, cin = false){
    const result = v1 + (v2 ^ 0xFF) + !cin;
    return {
        result: result & 0xFF,
        cout: !(result > 0xFF), // reversed since subtraction is strange
        zero: (result & 0xFF) === 0
    }
}
function processor_nand(v1, v2){
    const result = (v1 & v2) ^ 255;
    return {
        result,
        zero: result === 0
    };
}
class Processor extends EventTarget{
    /**
     * @type {number}
     */
    ip
    registers = new Uint8Array(5)
    /**
     * @type {Bus}
     */
    bus
    /**
     * @type {boolean}
     */
    halted = false

    /**
     * Returns a flag stored in the "Special Register"
     * @param {number} flag `PROCESSOR_FLAGS` flag
     * @returns {boolean} The stored flag
     */
    getFlag(flag){
        const flagRegisterValue = this.registers[4];
        return Boolean(flagRegisterValue & flag);
    }
    /**
     * Rewrites a flag in the "Special Register"
     * @param {number} flag `PROCESSOR_FLAGS` flag
     * @param {boolean} value The new flag value
     */
    setFlag(flag, value){
        // register 5 (index 4) is the flags register, aka "Special Register"
        if(value){
            this.registers[4] |= flag;
        }else{
            this.registers[4] &= flag ^ 255;
            // explanation: we mark all flags as active minus our flag parameter
        }
    }

    fetch(){
        const val = this.readFrom(this.ip);
        this.ip++;
        return val;
    }
    fetchAddress(){
        const val1 = this.fetch();
        const val2 = this.fetch();

        return (val1 << 8) | val2;
    }
    readFrom(address){
        return this.bus.read(address);
    }
    writeTo(address, val){
        return this.bus.write(address, val);
    }
    push(val){
        const stackAddress = STACK_OFFSET_ADDRESS + this.registers[3];
        this.writeTo(stackAddress, val);
        this.registers[3]--;
    }
    pop(){
        this.registers[3]++;
        const stackAddress = STACK_OFFSET_ADDRESS + this.registers[3];
        return this.readFrom(stackAddress);
    }

    step(){
        if(this.getFlag(PROCESSOR_FLAGS.HALTED)) return;
        const opcode = this.fetch();
        const operation = PROCESSOR_OPERATIONS[opcode];
        if(!operation){
            this.setFlag(PROCESSOR_FLAGS.HALTED, true);
        }else{
            operation(this);
        }

        const event = new CustomEvent("update");
        this.dispatchEvent(event);
        if(this.getFlag(PROCESSOR_FLAGS.halted)){
            const halted = new CustomEvent("halted");
            this.dispatchEvent(halted);
        }
    }

    reset(){
        this.registers[0] = this.registers[1] = this.registers[2] = this.registers[4] = 0;
        this.registers[3] = 255;
        this.registers[4] = 0b00000100;
        this.ip = DEFAULT_ADDRESS;
    }

    maskable_interrupt(argument1){
        if(this.getFlag(PROCESSOR_FLAGS.INTERRUPT)){
            this._interrupt(argument1);
            this.ip = MASKABLE_INTERRUPT_ADDRESS;
        }
    }
    non_maskable_interrupt(argument1){
        this._interrupt(argument1);
        this.ip = NON_MASKABLE_INTERRUPT_ADDRESS;
    }
    _interrupt(argument1){
        const ip_section = (this.ip & 0xFF00) >> 8;
        const ip_index = this.ip & 0x00FF;
        this.push(ip_section);
        this.push(ip_index);
        this.push(this.registers[0]);
        this.push(this.registers[1]);
        this.push(this.registers[2]);
        this.push(this.registers[4]);
        this.registers[0] = argument1;
    }

    constructor(bus){
        super();
        this.bus = bus;
    }
}
Object.freeze(PROCESSOR_OPERATIONS);
if(this.module){
    module.exports = {
        Processor,
        PROCESSOR_FLAGS,
        PROCESSOR_OPERATIONS,
        STACK_OFFSET_ADDRESS,
        DEFAULT_ADDRESS,
        MASKABLE_INTERRUPT_ADDRESS,
        NON_MASKABLE_INTERRUPT_ADDRESS
    };
}