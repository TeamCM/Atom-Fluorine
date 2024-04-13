document.querySelectorAll("button").forEach(b => {
    b.disabled = true;
});
const memory = new Memory();
const rom = new ROM();
const bus = new Bus();
let offset = 0x800;
bus.addComponent("ram", 0, 0x800, memory);
bus.addComponent("rom", 0x800, 0xFFFF, rom);
const cpu = new Processor(bus);
cpu.reset();

const DEFAULT_CODE = `; Welcome to Atom Fluorine assembly editor!

jmp main ; your program starts here
jmp maskable_interrupt ; if maskable interrupt is triggered, jump to the maskable interrupt handler
jmp non_maskable_interrupt ; if maskable interrupt is triggered, jump to the maskable non interrupt handler

main: ; insert your code here
hlt

maskable_interrupt: ; handles a maskable interrupt (interrupts that can be ignored, normally triggered by the program using the INT instruction)
reti

non_maskable_interrupt: ; handles a non maskable interrupt (interrupts that can't be ignored, normally triggered because of a error (not implemented in MkII) or hardware specific implementations)
reti`;
const noUpdateStackEl = document.querySelector("#noUpdateStack");
const noUpdateMemoryEl = document.querySelector("#noUpdateMemory");
const intervalTimeout = document.querySelector("#interval");
const stepTimes = document.querySelector("#stepTimes");
const ramViewer = document.querySelector("#ram-viewer");
const regel = document.querySelectorAll("#rvalues td");
const noUpdateInfo = document.querySelector("#noUpdateInfo");
const stackEl = document.querySelector("#stack");
const sregsEl = document.querySelectorAll("#srvalues td");
const uploadEl = document.querySelector("input[type=\"file\"]");
const downloadEl = document.querySelector("#download");
const enableDarkTheme = document.querySelector("#dark-theme");

const statusInfo = document.querySelector("#status");
const registersTable = document.querySelector("#registers");
const sregsTable = document.querySelector("#sregs");
let saveName = "atom2";
let editor;

function updateRegistersColors(){
    const regnames = document.querySelector("#registers tr").children;
    for(let i=0;i<regnames.length;i++){
        const reg = regnames[i];
        reg.style.backgroundColor = registersColors[i];
    }
}


function updateRegisters(){
    regel[0].textContent = cpu.registers[0];
    regel[1].textContent = cpu.registers[1];
    regel[2].textContent = cpu.registers[2];
    regel[3].textContent = cpu.registers[3];
    regel[4].textContent = cpu.registers[4].toString(2).padStart(8,"0");
}
function updateMemory(){
    let section = cpu.ip & 0xFF00;
    let k = 0;
    while(ramViewer.firstChild)
        ramViewer.firstChild.remove(); // forEach or for loops are glitched
    for(let i=0;i<16;i++){
        const tr = document.createElement("tr");
        for(let j=0;j<16;j++){
            const td = document.createElement("td");
            td.innerText = bus.read(section | k++);
            if(((cpu.ip & 0xFF) == k-1)){
                td.style.backgroundColor = "#44a";
                td.style.color = "#eee";
            }
            tr.append(td);
        }
        ramViewer.append(tr);
    }
}
/*const clearRightTrash = arr => {
    arr.reverse();
    while(!arr[0] && arr.length > 0) arr.shift();
    arr.reverse();
}*/

function updateStack(){
    while(stackEl.firstChild)
        stackEl.firstChild.remove();// forEach or for loops are glitched
    const stack = [];
    for(let i=255;i>=0;i--) stack.push(bus.read(i));
    const okStack = stack.slice(0,255 - cpu.registers[3]);
    for(let i=0;i<stack.length;i++){
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = stack[i];
        tr.append(td);
        if((okStack.length - 1) === i)
            td.style.backgroundColor = "#0000ee";
        stackEl.append(tr);
    }
}

function updateSRegs(){
    sregsEl[0].textContent = !!cpu.getFlag(PROCESSOR_FLAGS.HALTED);
    sregsEl[1].textContent = !!cpu.getFlag(PROCESSOR_FLAGS.INTERRUPT);
    sregsEl[2].textContent = !!cpu.getFlag(PROCESSOR_FLAGS.ZERO);
    sregsEl[3].textContent = !!cpu.getFlag(PROCESSOR_FLAGS.CARRY);
}


function instruction2string(){
    let ip = cpu.ip;
    const byte = cpu.readFrom(ip);
    const instruction_name = PROCESSOR_OPERATIONS[byte]?.name;
    if(!instruction_name){
        return `DB ${byte}`;
    }
    let instruction = instruction_name;
    const model = OPMODELS[instruction_name];
    ip++;
    for(const type of model){
        if(type === 0){
            instruction += ` ${cpu.readFrom(ip)}`;
            ip++;
        }else if(type === 1){
            const val1 = cpu.readFrom(ip);
            ip++;
            const val2 = cpu.readFrom(ip);
            ip++;
            const value = (val1 << 8) | val2;
            instruction += ` 0x${value.toString("16").padStart(4,"0")}`;
        }
    }
    return instruction;
}
function updateInfo(){
    try{
        statusInfo.innerText = `IP: ${cpu.ip}\nCurrent instruction: ${instruction2string()}`;
    }catch(e){
        statusInfo.innerText = `Error getting information about the processor.`;
        console.error(e);
    }
    updateRegisters();
    updateSRegs();
}
function updateAll(){
    if(!noUpdateInfo.checked) updateInfo();
    if(!noUpdateMemoryEl.checked) updateMemory();
    if(!noUpdateStackEl.checked) updateStack();
}

function reset(dontResetBus){
    cpu.reset();
    if(!dontResetBus) bus.reset();
    updateAll();
}

function compile_str(){
    try{
        const compiled = asm2code(editor.getValue(),offset);
        rom.loadData(compiled, offset);
        reset();
    }catch(e){
        console.info(e);
        const splitted = e.message.split(" ");
        if(e.constructor == SyntaxError){
            alert(`No op named ${splitted[0]} in line ${splitted[1]}`);
            editor.revealLine(parseInt(splitted[1]), 1);
            editor.setPosition(new monaco.Position(parseInt(splitted[1]), 0));
            editor.setSelection(new monaco.Selection(parseInt(splitted[1]), 0, parseInt(splitted[1]), Infinity));
        }else{
            alert(`No label ${splitted[0]}`);
            editor.revealLine(parseInt(splitted[1]), 1);
            editor.setPosition(new monaco.Position(parseInt(splitted[1]), 0));
            editor.setSelection(new monaco.Selection(parseInt(splitted[1]), 0, parseInt(splitted[1]), Infinity));
        }
    }
}

function downloadCode(){
    const url = "data:text/plain;charset=utf-8,"+encodeURIComponent(editor.getValue());
    downloadEl.download = "code.aasm";
    downloadEl.href = url;
    downloadEl.click();
}
function clearRightTrash2(arr){
    for(let i=arr.length-1;i>0;i--){
        if(arr[i]) break;
        arr.pop();
    }
}
function downloadBin(){
    const romCleaned = Array.from(rom);
    clearRightTrash2(romCleaned);
    const romVal = [];
    for(const val of romCleaned)
        romVal.push(String.fromCharCode(val));
    console.log(romCleaned, romVal.map(s => s.charCodeAt(0)));
    const url = "data:application/octet-stream,"+encodeURIComponent(romVal.join(""));
    downloadEl.download = "rom.bin";
    downloadEl.href = url;
    downloadEl.click();
}

function getFiles(){
    return new Promise(r => {
        uploadEl.onchange = e => r(e.target.files);
        uploadEl.click();
    });
}
async function uploadCode(){
    const file = (await getFiles())[0];
    editor.setValue(await file.text());
    compile_str();
    updateAll();
}
async function uploadBin(){
    const file = (await getFiles())[0];
    const text = await file.text();
    reset();
    rom.loadROM(text.split("").map(s => s.charCodeAt(0)));
    updateAll();
}

function makeStep(){
    for(let i=0;i<stepTimes.value;i++){
        if(cpu.halted) break;
        cpu.step();
    }
    updateAll();
}
function intervalClear(){
    clearInterval(interval);
    interval = undefined;
}
function intervalStep(){
    if(interval) intervalClear();
    interval = setInterval(makeStep, parseInt(intervalTimeout.value));
}

function updateInfoDisplay(updateChecked){
    if(window.localStorage.getItem("info-disabled")){
        statusInfo.classList.add("hidden");
        registersTable.classList.add("hidden");
        sregsTable.classList.add("hidden");
    }else{
        statusInfo.classList.remove("hidden");
        registersTable.classList.remove("hidden");
        sregsTable.classList.remove("hidden");
        updateInfo();
    }
    if(updateChecked) noUpdateInfo.checked = window.localStorage.getItem("info-disabled");
}
noUpdateInfo.addEventListener("change", () => {
    window.localStorage.setItem("info-disabled", noUpdateInfo.checked ? "1" : "0");
    updateInfoDisplay();
});
function updateStackDisplay(updateChecked){
    if(window.localStorage.getItem("stack-disabled"))
        while(stackEl.firstChild)
            stackEl.firstChild.remove();// forEach or for loops are glitched
    if(updateChecked) noUpdateStackEl.checked = window.localStorage.getItem("stack-disabled");
}
noUpdateStackEl.addEventListener("change", () => {
    window.localStorage.setItem("stack-disabled", noUpdateStackEl.checked ? "1" : "0");
    updateStackDisplay();
});
function updateMemoryDisplay(updateChecked){
    if(window.localStorage.getItem("memory-disabled"))
        while(ramViewer.firstChild)
            ramViewer.firstChild.remove();// forEach or for loops are glitched
    if(updateChecked) noUpdateMemoryEl.checked = window.localStorage.getItem("memory-disabled");
}
noUpdateMemoryEl.addEventListener("change", () => {
    window.localStorage.setItem("memory-disabled", noUpdateMemoryEl.checked ? "1" : "0");
    updateMemoryDisplay();
});

function saveCode(){
    localStorage.setItem(saveName, editor.getValue());
}
function loadCode(){
    const code = localStorage.getItem(saveName);
    editor.setValue(code ? code : DEFAULT_CODE);
}
function isFirstTime(){
    return !window.localStorage.getItem("alreadyVisited");
}
function restore(){
    updateStackDisplay();
    updateMemoryDisplay();
    updateInfoDisplay();
}
function load(){
    monaco.languages.register({
        id: "assembly"
    });
    
    monaco.languages.setMonarchTokensProvider("assembly", {
        ignoreCase: true,
        defaultToken: "invalid",
        tokenizer: {
            root: [
                {include: "@comment"},
                {include: "@variables"},
                {include: "@numbers"},
                {include: "@string"},
                {include: "@defineConstants"},
                {include: "@controllers"},
                {include: "@math"},
                {include: "@memory"},
                {include: "@stack"},
                {include: "@flag"}
                //[/((lda)|(ldx)|(ldy)|(sta)|(stx)|(sty))/i, "memory"],
                //[/((pusha)|(pushx)|(pushy)|(popa)|(popx)|(popy))/i, "stack"],
                //[/(ada)|(adx)|(ady)|(sua)|(sux)|(suy)|(nana)|(nanx)|(nany)|(cma)|(cmx)|(cmy)/i, "math"],
                //[/(ccf)|(czf)|(cif)|(scf)|(szf)|(sif)/i, "flag"]
            ],
            comment: [
                [/;.+/, "comment"]
            ],
            variables: [
                [/.+:/, "variable.name"],
            ],
            numbers: [
                [/0x[0-9a-f]+/i, "number"],
                [/0b[0-1]+/i, "number"],
                [/\d+/, "number"],
            ],
            string: [
                [/"/, "string", "@stringEnd"]
            ],
            stringEnd: [
                [/\\"/, "string.escape"],
                [/"/, "string", "@pop"],
                [/./, "string"]
            ],
            defineConstants: [
                [/db/i, "constant"]
            ],
            controllers: [
                [/^(int)|(reti)|(ret)|(hlt)\b/i, "keyword"],
                [/^(jmp)|(call)|(ret)|(jz)|(jc)|(jnz)|(jnc)|(rst)\b/i, "keyword", "@controllerVariable"]
            ],
            controllerVariable: [
                [/.+|((?=;))/, "variable.name", "@pop"]
            ],
            math: [
                [/^(ada)|(adx)|(ady)|(sua)|(sux)|(suy)|(nana)|(nanx)|(nany)|(cma)|(cmx)|(cmy)\b/i, "attribute.value"]
            ],
            memory: [
                [/^((lda)|(ldx)|(ldy)|(ldia)|(ldix)|(ldiy)|(sta)|(stx)|(sty))\b/i, "type"]
            ],
            stack: [
                [/(pusha)|(pushx)|(pushy)|(popa)|(popx)|(popy)/i, "delimiter"]
            ],
            flag: [
                [/(ccf)|(czf)|(cif)|(scf)|(szf)|(sif)/i, "type"]
            ]
        }
    });
    
    editor = monaco.editor.create(document.querySelector("#code"), {
        theme: "hc-black",
        language: "assembly",
        value: "; Loading..."
    });
    function updateTheme(){
        if(enableDarkTheme.checked){
            document.documentElement.classList.add("dark-theme");
            window.localStorage.setItem("dark-theme", "true");
            monaco.editor.setTheme("hc-black");
        }else{
            document.documentElement.classList.remove("dark-theme");
            window.localStorage.removeItem("dark-theme");
            monaco.editor.setTheme("hc-light");
        }
    }
    enableDarkTheme.addEventListener("change", updateTheme);
    document.querySelectorAll("button").forEach(b => {
        b.disabled = false;
    });
    if(isFirstTime()){
        window.localStorage.setItem("alreadyVisited", "1");
        window.localStorage.setItem("dark-theme", "true");
        window.localStorage.setItem("stack-disabled", "1");
    }
    if(window.localStorage.getItem("dark-theme")){
        enableDarkTheme.checked = true;
        updateTheme();
    }
    updateInfoDisplay(true);
    updateMemoryDisplay(true);
    updateStackDisplay(true);
    updateTheme();
    loadCode();
    compile_str();
    updateAll();
}