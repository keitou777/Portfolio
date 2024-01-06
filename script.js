// Your JavaScript logic goes here

// Data structure to store shifts
let shifts = loadShiftsFromLocalStorage() || [];

function addShift() {
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    // Calculate hours
    const hours = calculateHours(startTime, endTime);

    // Get day of the week
    const dayOfWeek = getDayOfWeek(date);

    const shift = {
        date,
        startTime,
        endTime,
        hours,
        dayOfWeek
    };
    shifts.push(shift);
    saveShiftsToLocalStorage(); // Save shifts after adding a new shift
    displayShifts();
    clearInputFields();
}


function getDayOfWeek(date) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayIndex = new Date(date).getDay();
    return daysOfWeek[dayIndex];
}

function removeShift(index) {
    if (index >= 0 && index < shifts.length) {
        shifts.splice(index, 1);
        saveShiftsToLocalStorage(); // Save shifts after removing a shift
        displayShifts();
    }
}

function viewShifts() {
    displayShifts();
}

function calculateSummary() {

    const selectedYear = document.getElementById("year").value;
    const selectedMonth = document.getElementById("month").value;

    // Filter shifts based on the selected month and year
    const filteredShifts = shifts.filter((shift) => {
        const shiftDate = new Date(shift.date);
        return shiftDate.getFullYear() == selectedYear && (shiftDate.getMonth() + 1) == selectedMonth;
    });

    // Calculate summary for the filtered shifts
    const totalHours = filteredShifts.reduce((total, shift) => total + getMinutes(shift.hours), 0);



//    const totalHours = shifts.reduce((total, shift) => total + getMinutes(shift.hours), 0);

    // Filter shifts on Saturday
    const shiftsSat = filteredShifts.filter((shift) => shift.dayOfWeek === 'Sat');

    // Calculate total hours on Saturday after 13:00
    const totalHoursSatAfter13 = shiftsSat.reduce((total, shift) => {
    const shiftStartTime = new Date(`2000-01-01 ${shift.startTime}`);
    const shiftEndTime = new Date(`2000-01-01 ${shift.endTime}`);

    // If the shift ends before 13:00 or starts after 14:00, skip this shift
    if (shiftEndTime.getHours() < 13 ) {
        return total;
    }

    // Calculate hours after 13:00
    const hoursAfter13 = Math.max(0, Math.floor((shiftEndTime - Math.max(shiftStartTime, new Date(`2000-01-01 13:00`))) / (1000 * 60 * 60)));
    const minutesAfter13 = Math.max(0, Math.floor(((shiftEndTime - Math.max(shiftStartTime, new Date(`2000-01-01 13:00`))) % (1000 * 60 * 60)) / (1000 * 60)));

    return total + hoursAfter13 * 60 + minutesAfter13;
}, 0);


    // Filter shifts on Sunday
    const shiftsSun = filteredShifts.filter((shift) => shift.dayOfWeek === 'Sun');

    // Calculate total hours on Sunday
    const totalHoursSun = shiftsSun.reduce((total, shift) => total + getMinutes(shift.hours), 0);

    // Calculate total hours and minutes
    const hours = Math.floor(totalHours / 60);
    const minutes = totalHours % 60;

    // Calculate total hours and minutes on Saturday after 13:00
    const hoursSatAfter13 = Math.floor(totalHoursSatAfter13 / 60);
    const minutesSatAfter13 = totalHoursSatAfter13 % 60;

    // Calculate total hours and minutes on Sunday
    const hoursSun = Math.floor(totalHoursSun / 60);
    const minutesSun = totalHoursSun % 60;
    
    
    // Format minutes to always display double digits
    const formattedMinutes = (minutes < 10) ? `0${minutes}` : minutes;
    const formattedMinutesSatAfter13 = (minutesSatAfter13 < 10) ? `0${minutesSatAfter13}` : minutesSatAfter13;
    const formattedMinutesSun = (minutesSun < 10) ? `0${minutesSun}` : minutesSun;
  
    // Check if Saturday and Sunday hours are non-zero before including them in the alert
    let alertMessage = `Summary for ${selectedYear} / ${monthToMonthName(selectedMonth)} :\n\nTotal hours = ${hours}:${formattedMinutes}\n`;
    
    if (hoursSatAfter13 > 0 || minutesSatAfter13 > 0) {
    alertMessage += `\nSat bonus = ${hoursSatAfter13} : ${formattedMinutesSatAfter13}`;
    }
    
    if (hoursSun > 0 || minutesSun > 0) {
    alertMessage += `\nSun bonus = ${hoursSun} : ${formattedMinutesSun}`;
    }
    
    // Display the alert message
    alert(alertMessage);

}


function saveShiftsToLocalStorage() {
    localStorage.setItem('shifts', JSON.stringify(shifts));
}

function loadShiftsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('shifts'));
}


function displayShifts() {
    const shiftList = document.getElementById("shiftList");
    shiftList.innerHTML = "";

    shifts.forEach((shift, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `[${index + 1}]: ${shift.date} (${shift.dayOfWeek}) - ${shift.startTime} - ${shift.endTime} = ${shift.hours} hours
                             <button onclick="removeShift(${index})">Remove</button>`;
        shiftList.appendChild(listItem);
    });
    document.getElementById("shiftDisplay").style.display = "block";
}

function clearInputFields() {
    document.getElementById("date").value = "";
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";
}

function calculateHours(start, end) {
    const startDateTime = new Date(`2000-01-01 ${start}`);
    const endDateTime = new Date(`2000-01-01 ${end}`);
    const timeDifference = endDateTime - startDateTime;
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function getMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

// Function to populate years in the dropdown
function populateYears() {
    const yearDropdown = document.getElementById("year");
    const currentYear = new Date().getFullYear();

    // Get unique years from the stored shifts
    const uniqueYears = [...new Set(shifts.map(shift => new Date(shift.date).getFullYear()))];

    for (let year of uniqueYears) {
        const option = document.createElement("option");
        option.value = year;
        option.text = year;
        yearDropdown.add(option);
    }
}

// Function to populate months in the dropdown
function populateMonths() {
    const monthDropdown = document.getElementById("month");

    // Get unique months from the stored shifts and sort them in ascending order
    const uniqueMonths = [...new Set(shifts.map(shift => new Date(shift.date).getMonth() + 1))]
                        .sort((a, b) => a - b);
                        
    for (let month of uniqueMonths) {
        const option = document.createElement("option");
        option.value = month;
        option.text = monthToMonthName(month);
        monthDropdown.add(option);
    }
}

// Helper function to convert month number to month name
function monthToMonthName(month) {
    const monthNames = [
        "01", "02", "03", "04",
        "05", "06", "07", "08",
        "09", "10", "11", "12"
    ];

    return monthNames[month - 1];
}

// Call the function to populate years on page load
populateYears();
populateMonths();

// Add this line to make sure the months are populated based on the selected year
document.getElementById("year").addEventListener("change", populateMonths);

displayShifts();
