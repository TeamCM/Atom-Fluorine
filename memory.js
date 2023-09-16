class Memory extends Uint8Array{
    constructor(){
        super(2 ** 16 - 1);
    }
    readByte(address){
        return this[address];
    }
    writeByte(address, val){
        this[address] = val;
    }
}
class ROM extends Memory{
    writeByte(){}
    /**
     * 
     * @param {Uint8Array} mem 
     */
    loadData(mem){
        mem.forEach((v, i) => {
            this[i] = v;
        });
    }
}