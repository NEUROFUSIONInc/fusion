import { notion } from "./neurosity";

export function getNeurositySelectedDevice() {
    return localStorage.getItem("neurositySelectedDevice")
}

export function updateNeurositySelectedDevice(event) {
    const deviceId = event.target.value;
    alert(`selected device id - ${deviceId}`);
    localStorage.setItem("neurositySelectedDevice", deviceId)

    connectToNeurosityDevice(deviceId);
}

export function connectToNeurosityDevice(deviceId) {
    (async () => {
        await notion.selectDevice(["deviceId", deviceId]).then(() => {
            console.log(`connected to neurosity device ${deviceId}`)
        });
    })();
}