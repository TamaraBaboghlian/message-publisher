$(() => {

    let index = 1;
    //not specifying any URL when I call io(), since by default it tries to connect to the host served the page.
    const socket = io();
    const message = $("#mesg-text");
    const table = document.getElementById("mesg-tbl");

    $("#send-btn").click(() => {
        const chatMesg = { message: message.val() };
        $.post("http://localhost:3000/publish", chatMesg)
            .fail(err => {
                alert(JSON.stringify(err.responseText));
            });
        message.val('');
    })

    socket.on("pub message", (msg) => {
        const row = table.insertRow(0);
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.innerHTML = index++;
        cell2.innerHTML = msg;
    });
});
