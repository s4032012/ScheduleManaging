document.addEventListener('DOMContentLoaded', function() {
    let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    let selectedEventId = null;
    let calendar;

    // Khởi tạo FullCalendar
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'vi',
        events: schedules.map(s => ({
            id: s.id.toString(),
            title: s.subject,
            start: `${s.date}T${s.startTime}`,
            end: `${s.date}T${s.endTime}`,
            extendedProps: {
                notes: s.notes,
                materials: s.materials
            }
        })),
        eventClick: function(info) {
            showEventModal(info.event);
        },
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }
    });
    calendar.render();

    // Toggle sidebar
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Toggle form
    document.getElementById('toggle-form').addEventListener('click', (e) => {
        e.preventDefault();
        const form = document.getElementById('schedule-form');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        if (window.innerWidth <= 768) sidebar.classList.remove('active');
    });

    // Toggle theme
    document.getElementById('toggle-theme').addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        if (window.innerWidth <= 768) sidebar.classList.remove('active');
    });

    // Load theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Thêm lịch học
    window.addSchedule = function() {
        const subject = document.getElementById('subject').value.trim();
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const notes = document.getElementById('notes').value.trim();
        const materialFile = document.getElementById('material-file').files[0];
        const materialLink = document.getElementById('material-link').value.trim();

        if (!subject || !date || !startTime || !endTime) {
            showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'var(--danger)');
            return;
        }

        const materials = materialLink ? materialLink : (materialFile ? materialFile.name : 'Không có tài liệu');

        const schedule = {
            id: Date.now(),
            subject,
            date,
            startTime,
            endTime,
            notes,
            materials
        };

        schedules.push(schedule);
        saveSchedules();
        calendar.addEvent({
            id: schedule.id.toString(),
            title: schedule.subject,
            start: `${schedule.date}T${schedule.startTime}`,
            end: `${schedule.date}T${schedule.endTime}`,
            extendedProps: { notes: schedule.notes, materials: schedule.materials }
        });

        showNotification('Đã thêm lịch học thành công!', 'var(--success)');
        closeForm();
    };

    // Đóng form
    window.closeForm = function() {
        document.getElementById('schedule-form').style.display = 'none';
        document.querySelector('.schedule-form').reset();
    };

    // Hiển thị modal
    window.showEventModal = function(event) {
        selectedEventId = event.id;
        document.getElementById('modal-subject').textContent = event.title;
        document.getElementById('modal-date').textContent = event.start.toLocaleDateString('vi-VN');
        document.getElementById('modal-time').textContent = `${event.start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
        document.getElementById('modal-notes').textContent = event.extendedProps.notes || 'Không có';
        
        const materials = event.extendedProps.materials;
        const materialsSpan = document.getElementById('modal-materials');
        if (materials.startsWith('http')) {
            materialsSpan.innerHTML = `<a href="${materials}" target="_blank">${materials}</a>`;
        } else {
            materialsSpan.textContent = materials || 'Không có';
        }
        
        document.getElementById('event-modal').style.display = 'flex';
    };

    // Đóng modal
    window.closeModal = function() {
        document.getElementById('event-modal').style.display = 'none';
        selectedEventId = null;
    };

    // Sửa sự kiện
    window.editEvent = function() {
        const schedule = schedules.find(s => s.id.toString() === selectedEventId);
        if (!schedule) return;

        document.getElementById('subject').value = schedule.subject;
        document.getElementById('date').value = schedule.date;
        document.getElementById('start-time').value = schedule.startTime;
        document.getElementById('end-time').value = schedule.endTime;
        document.getElementById('notes').value = schedule.notes;
        if (schedule.materials.startsWith('http')) {
            document.getElementById('material-link').value = schedule.materials;
        }

        document.getElementById('schedule-form').style.display = 'block';
        deleteEvent();
    };

    // Xóa sự kiện
    window.deleteEvent = function() {
        schedules = schedules.filter(s => s.id.toString() !== selectedEventId);
        saveSchedules();
        const event = calendar.getEventById(selectedEventId);
        if (event) event.remove();
        showNotification('Đã xóa lịch học thành công!', 'var(--success)');
        closeModal();
    };

    // Lưu vào localStorage
    function saveSchedules() {
        localStorage.setItem('schedules', JSON.stringify(schedules));
    }

    // Hiển thị thông báo
    function showNotification(message, color) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.background = color;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
});