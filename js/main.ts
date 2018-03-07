/// <reference path="chat.ts" />
/// <reference path="client.ts" />
/// <reference path="utils/modal.ts" />
/// <reference path="ui/modal/ModalConnect.ts" />


let globalClient = new TSClient();
let chat = new ChatBox($("#chat"));
globalClient.setup();
//globalClient.startConnection("localhost:19974"); //TODO remove only for testing

let modal = 0;
$("#test").click(function () {
    console.log("Executing test function");
});
//$("#test").trigger("click");
$("#test_tab").tabify();

//Modals.spawnConnectModal();
Modals.spawnSettingsModal();
/*
createErrorModal("Could not connect to remote host",() => {
    let tag = $.spawn("div");
    tag.append("A fatal error occurred while connecting to host:port<br/>");
    tag.append("Please reload the page and try again!<br/>");
    return tag;
}, {
    footer: ""
}).open();
*/