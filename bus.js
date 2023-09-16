// https://github.com/TeamCM/Atom-Processor/blob/bc7f899243913402a2b3ed8bebcfdace82a36bd2/static/components.js#L91
const Bus = class Bus{
    rangesClasses = {}
    ranges = {}
    /**
     * @param {number} addr 
     * @returns {Array<any, number>}
     */
    findClassByAddr(addr){
        const entries = Object.entries(this.ranges);
        let addrFromRet;
        let range;
        for(let i=0;i<entries.length;i++){
            const entry = entries[i];
            const [addrFrom,addrTo] = entry[1];
            if((addrFrom <= addr) && (addrTo > addr)){
                range = this.rangesClasses[entry[0]];
                addrFromRet = addrFrom;
                break;
            }
        }
        return [range,addrFromRet]
    }
    addComponent(id,addressFrom,addressTo,memoryClass){
        this.ranges[id] = [addressFrom,addressTo];
        this.rangesClasses[id] = memoryClass;
    }
    removeComponent(id){
        delete this.ranges[id];
        delete this.rangesClasses[id];
    }
    read(address){
        const [mem,addrFrom] = this.findClassByAddr(address);
        return mem.readByte(address-addrFrom);
    }
    write(address,value){
        const [mem,addrFrom] = this.findClassByAddr(address);
        mem.writeByte(address-addrFrom,value);
    }
    reset(){
        Object.keys(this.rangesClasses).forEach(r => {
            this.rangesClasses[r].reset?.();
        });
    }
}
if(this.module){
    module.exports = Bus;
}