async function getMyTasks() {
    const username = document.getElementById('usernameInput').value;
    const taskListDiv = document.getElementById('taskList');

    if (!username) return alert("กรุณาพิมพ์ชื่อก่อนนะ!");

    try {
        // ยิง Fetch ไปที่ Backend ที่เราเพิ่งสร้าง
        const response = await fetch(`http://localhost:3000/tasks/${username}`);
        const data = await response.json();

        if (response.status !== 200) {
            taskListDiv.innerHTML = `<p class="text-red-500">${data.error}</p>`;
            return;
        }

        // ล้างข้อมูลเก่าแล้ววนลูปแสดงผลใหม่
        taskListDiv.innerHTML = ""; 
        data.forEach(task => {
            taskListDiv.innerHTML += `
                <div class="p-3 border rounded shadow-sm bg-white flex justify-between">
                    <span>${task.title}</span>
                    <span class="${task.is_completed ? 'text-green-500' : 'text-orange-500'}">
                        ${task.is_completed ? '✅ สำเร็จ' : '⏳ รอดำเนินการ'}
                    </span>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error:", error);
        alert("เชื่อมต่อ Server ไม่ได้!");
    }
}