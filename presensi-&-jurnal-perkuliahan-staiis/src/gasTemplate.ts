/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const googleAppsScriptCode = `/**
 * SIAKAD PRESENSI & JURNAL PERKULIAHAN - Google Apps Script Backend Database
 * 
 * Silakan copy seluruh kode ini dan tempelkan ke editor Google Apps Script Anda.
 * Dapatkan petunjuk lengkap di tab "Konfigurasi Sheets (GAS)".
 */

const SPREADSHEET_ID = ""; // Kosongkan agar otomatis menggunakan spreadsheet tempat script terpasang

function getSheet(name) {
  const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    setupHeaders(sheet, name);
  }
  return sheet;
}

function setupHeaders(sheet, name) {
  const headers = {
    "users": ["ID", "Nama Lengkap", "Email", "Password", "Role", "Program Studi", "Semester", "NIP / NIM", "Status"],
    "courses": ["Kode MK", "Nama MK", "Hari", "Jam Mulai", "Jam Selesai", "Ruang", "Dosen Pengampu", "Semester"],
    "enrollments": ["ID Mahasiswa", "Kode MK", "Tahun Akademik"],
    "attendance_sessions": ["ID Sesi", "Kode MK", "Tanggal", "Jam Mulai Presensi", "Jam Selesai Presensi", "Kode Unik", "Status"],
    "attendances": ["ID Sesi", "ID Mahasiswa", "Status Kehadiran", "Waktu Presensi", "IP Address / Metode"],
    "journals": ["ID Jurnal", "Kode MK", "Tanggal", "Judul", "Isi", "Lampiran", "Dibuat oleh"]
  };
  
  if (headers[name]) {
    sheet.appendRow(headers[name]);
    sheet.getRange(1, 1, 1, headers[name].length).setFontWeight("bold").setBackground("#e2e8f0");
  }
}

// Inisialisasi data mula-mula jika spreadsheet masih kosong
function initializeDatabase() {
  const userSheet = getSheet("users");
  if (userSheet.getLastRow() <= 1) {
    // Tambahkan Dosen Default
    userSheet.appendRow(["dosen-1", "Prof. Dr. Ahmad Syarif, M.A.", "ahmad@siakad.ac.id", "dosen123", "DOSEN", "Pendidikan Agama Islam", "", "198012122005011002", "AKTIF"]);
    userSheet.appendRow(["dosen-2", "Dr. Laila Fitriana, M.Ag.", "laila@siakad.ac.id", "dosen123", "DOSEN", "Hukum Keluarga Islam", "", "198506152010022004", "AKTIF"]);
    
    // Tambahkan Mahasiswa Default
    userSheet.appendRow(["mhs-1", "Muhammad Al-Fatih", "fatih@siakad.ac.id", "mhs123", "MAHASISWA", "Pendidikan Agama Islam", "4", "12211045", "AKTIF"]);
    userSheet.appendRow(["mhs-2", "Aisyah Humaira", "aisyah@siakad.ac.id", "mhs123", "MAHASISWA", "Pendidikan Agama Islam", "4", "12211046", "AKTIF"]);
    userSheet.appendRow(["mhs-3", "Raihan Az-Zahra", "raihan@siakad.ac.id", "mhs123", "MAHASISWA", "Pendidikan Agama Islam", "2", "12211054", "AKTIF"]);
  }
  
  const courseSheet = getSheet("courses");
  if (courseSheet.getLastRow() <= 1) {
    courseSheet.appendRow(["PAI-402", "Ulumul Qur'an dan Metodologi Tafsir", "Senin", "08:15", "10:15", "Gedung Tarbiyah R.304", "dosen-1", "Ganjil 2025/2026"]);
    courseSheet.appendRow(["PAI-405", "Sejarah Peradaban Islam Nusantara", "Rabu", "10:30", "12:30", "AULA Ibn Khaldun", "dosen-1", "Ganjil 2025/2026"]);
    courseSheet.appendRow(["HKI-201", "Fiqh Munakahat & Perbandingan Madzhab", "Selasa", "13:00", "15:00", "Gedung Syariah R.102", "dosen-2", "Ganjil 2025/2026"]);
  }
  
  const enrollSheet = getSheet("enrollments");
  if (enrollSheet.getLastRow() <= 1) {
    enrollSheet.appendRow(["mhs-1", "PAI-402", "2025/2026"]);
    enrollSheet.appendRow(["mhs-1", "PAI-405", "2025/2026"]);
    enrollSheet.appendRow(["mhs-2", "PAI-402", "2025/2026"]);
    enrollSheet.appendRow(["mhs-2", "PAI-405", "2025/2026"]);
    enrollSheet.appendRow(["mhs-3", "PAI-402", "2025/2026"]);
  }
  
  return "Inisialisasi berhasil dilakukan!";
}

// Handler request GET
function doGet(e) {
  const action = e.parameter.action;
  let responseData = { error: "Action tidak ditemukan or parameter invalid" };
  
  try {
    if (!action) {
      return ContentService.createTextOutput(JSON.stringify({ error: "No action provided" }))
          .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getUserData") {
      responseData = getUsersData();
    } else if (action === "getCourses") {
      responseData = getCoursesData();
    } else if (action === "getEnrollments") {
      responseData = getEnrollmentsData();
    } else if (action === "getSessions") {
      responseData = getSessionsData();
    } else if (action === "getAttendances") {
      responseData = getAttendancesData();
    } else if (action === "getJournals") {
      responseData = getJournalsData();
    } else if (action === "initialize") {
      responseData = { result: initializeDatabase() };
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: responseData }))
        .setMimeType(ContentService.MimeType.JSON);
        
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handler request POST
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // 15 detik timeout mencegah tabrakan data
    
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    let result = { error: "Modul aksi POST tidak sesuai" };
    
    if (action === "login") {
      result = performLogin(postData.email, postData.password);
    } else if (action === "register") {
      result = performRegister(postData);
    } else if (action === "createCourse") {
      result = createCourse(postData.course);
    } else if (action === "updateCourse") {
      result = updateCourse(postData.kodeMK, postData.course);
    } else if (action === "deleteCourse") {
      result = deleteCourse(postData.kodeMK);
    } else if (action === "openSession") {
      result = openSession(postData.session);
    } else if (action === "recordAttendance") {
      result = recordAttendance(postData.attendance);
    } else if (action === "updateAttendanceByDosen") {
      result = updateAttendanceByDosen(postData.idSesi, postData.attendances);
    } else if (action === "saveJournal") {
      result = saveJournal(postData.journal);
    } else if (action === "deleteJournal") {
      result = deleteJournal(postData.idJurnal);
    }
    
    SpreadsheetApp.flush();
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
        .setMimeType(ContentService.MimeType.JSON);
        
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// ---------------------- DATABASE HELPER FUNCTIONS ----------------------

function readSheetAsJson(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  return rows;
}

function getUsersData() {
  return readSheetAsJson("users").map(u => {
    const userCopy = { ...u };
    ["Password", "password", "Kata Sandi", "kata_sandi", "Sandi", "sandi"].forEach(function(k) {
      delete userCopy[k];
    });
    return userCopy;
  });
}

function getCoursesData() {
  return readSheetAsJson("courses");
}

function getEnrollmentsData() {
  return readSheetAsJson("enrollments");
}

function getSessionsData() {
  return readSheetAsJson("attendance_sessions");
}

function getAttendancesData() {
  return readSheetAsJson("attendances");
}

function getJournalsData() {
  return readSheetAsJson("journals");
}

// Helper to safely convert spreadsheet cell values to trimmed string
function safeString(val) {
  if (val === null || val === undefined) return "";
  return val.toString().trim();
}

// Helper to look up values case-insensitively and whitespace-trimmed
function getRowValue(row, keys) {
  if (!row) return "";
  const cleanKeys = keys.map(function(k) { return k.toString().trim().toLowerCase(); });
  for (var actualKey in row) {
    const cleanActualKey = actualKey.toString().trim().toLowerCase();
    if (cleanKeys.indexOf(cleanActualKey) !== -1) {
      return row[actualKey];
    }
  }
  return "";
}

function performLogin(email, password) {
  const users = readSheetAsJson("users");
  const searchEmail = safeString(email).toLowerCase();
  const searchPass = safeString(password);
  
  const found = users.find(function(u) {
    const uEmail = safeString(getRowValue(u, ["Email", "email"])).toLowerCase();
    const uPass = safeString(getRowValue(u, ["Password", "password", "Kata Sandi", "kata_sandi", "Sandi", "sandi"]));
    return uEmail === searchEmail && uPass === searchPass;
  });
  
  if (found) {
    const userData = { ...found };
    ["Password", "password", "Kata Sandi", "kata_sandi", "Sandi", "sandi"].forEach(function(k) {
      delete userData[k];
    });
    return { success: true, user: userData };
  } else {
    return { success: false, message: "Kredensial atau kata sandi Anda tidak cocok!" };
  }
}

function performRegister(data) {
  const sheet = getSheet("users");
  const users = readSheetAsJson("users");
  const email = safeString(data.email).toLowerCase();
  
  const found = users.find(function(u) {
    return safeString(getRowValue(u, ["Email", "email"])).toLowerCase() === email;
  });
  if (found) {
    throw new Error("Email ini sudah terdaftar sebelumnya!");
  }
  
  sheet.appendRow([
    safeString(data.id),
    safeString(data.name),
    safeString(data.email),
    safeString(data.password),
    safeString(data.role),
    safeString(data.programStudi),
    data.semester !== undefined ? safeString(data.semester) : "",
    safeString(data.nipNim),
    safeString(data.status || "AKTIF")
  ]);
  
  // Auto-enroll in courses for convenience
  if (data.role === "MAHASISWA") {
    try {
      const enrollSheet = getSheet("enrollments");
      const courses = readSheetAsJson("courses");
      courses.forEach(function(c) {
        enrollSheet.appendRow([safeString(data.id), safeString(c["Kode MK"] || c.kodeMK), "2025/2026"]);
      });
    } catch (e) {
      // ignore enrollment error to keep main register flow working
    }
  }
  
  return { success: true };
}

function createCourse(course) {
  const sheet = getSheet("courses");
  sheet.appendRow([
    course.kodeMK,
    course.namaMK,
    course.hari,
    course.jamMulai,
    course.jamSelesai,
    course.ruang,
    course.dosenId,
    course.semester
  ]);
  return { success: true };
}

function updateCourse(kodeMK, course) {
  const sheet = getSheet("courses");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === kodeMK) {
      sheet.getRange(i + 1, 1, 1, 8).setValues([[
        course.kodeMK,
        course.namaMK,
        course.hari,
        course.jamMulai,
        course.jamSelesai,
        course.ruang,
        course.dosenId,
        course.semester
      ]]);
      return { success: true };
    }
  }
  return { success: false, error: "MK tidak ditemukan" };
}

function deleteCourse(kodeMK) {
  const sheet = getSheet("courses");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === kodeMK) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: "MK tidak ditemukan" };
}

function openSession(session) {
  const sheet = getSheet("attendance_sessions");
  const idSesi = "session-" + Utilities.getUuid().substring(0, 8);
  sheet.appendRow([
    idSesi,
    session.kodeMK,
    session.tanggal,
    session.jamMulaiPresensi || "",
    session.jamSelesaiPresensi || "",
    session.kodeUnik || "",
    session.status || "DIBUKA"
  ]);
  return { success: true, idSesi: idSesi };
}

function recordAttendance(att) {
  const sessionSheet = getSheet("attendance_sessions");
  const sessionData = sessionSheet.getDataRange().getValues();
  let validSession = false;
  let kodeUnikRequired = "";
  
  for (let i = 1; i < sessionData.length; i++) {
    if (sessionData[i][0] === att.idSesi) {
      if (sessionData[i][6] === "DIBUKA") {
        validSession = true;
        kodeUnikRequired = sessionData[i][5].toString();
      }
      break;
    }
  }
  
  if (!validSession) {
    return { success: false, error: "Sesi presensi sudah ditutup atau tidak aktif!" };
  }
  
  if (kodeUnikRequired && att.kodeMasukkan !== kodeUnikRequired) {
    return { success: false, error: "Kode verifikasi salah!" };
  }
  
  const attSheet = getSheet("attendances");
  const attData = attSheet.getDataRange().getValues();
  let rowIdx = -1;
  
  for (let j = 1; j < attData.length; j++) {
    if (attData[j][0] === att.idSesi && attData[j][1] === att.idMahasiswa) {
      rowIdx = j + 1;
      break;
    }
  }
  
  if (rowIdx !== -1) {
    attSheet.getRange(rowIdx, 3, 1, 3).setValues([[
      att.statusKehadiran,
      new Date().toISOString(),
      att.ipAddressMetode
    ]]);
  } else {
    attSheet.appendRow([
      att.idSesi,
      att.idMahasiswa,
      att.statusKehadiran,
      new Date().toISOString(),
      att.ipAddressMetode
    ]);
  }
  return { success: true };
}

function updateAttendanceByDosen(idSesi, attendancesList) {
  const attSheet = getSheet("attendances");
  
  attendancesList.forEach(att => {
    const data = attSheet.getDataRange().getValues();
    let rowIdx = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === idSesi && data[i][1] === att.idMahasiswa) {
        rowIdx = i + 1;
        break;
      }
    }
    
    if (rowIdx !== -1) {
      attSheet.getRange(rowIdx, 3, 1, 3).setValues([[
        att.statusKehadiran,
        new Date().toISOString(),
        att.ipAddressMetode || "Dosen Manual"
      ]]);
    } else {
      attSheet.appendRow([
        idSesi,
        att.idMahasiswa,
        att.statusKehadiran,
        new Date().toISOString(),
        att.ipAddressMetode || "Dosen Manual"
      ]);
    }
  });
  
  return { success: true };
}

function saveJournal(journal) {
  const sheet = getSheet("journals");
  const data = sheet.getDataRange().getValues();
  const idJurnal = journal.idJurnal || "journal-" + Utilities.getUuid().substring(0, 8);
  
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === idJurnal) {
      rowIdx = i + 1;
      break;
    }
  }
  
  if (rowIdx !== -1) {
    sheet.getRange(rowIdx, 2, 1, 6).setValues([[
      journal.kodeMK,
      journal.tanggal,
      journal.judul,
      journal.isi,
      journal.lampiran || "",
      journal.dibuatOleh
    ]]);
  } else {
    sheet.appendRow([
      idJurnal,
      journal.kodeMK,
      journal.tanggal,
      journal.judul,
      journal.isi,
      journal.lampiran || "",
      journal.dibuatOleh
    ]);
  }
  
  return { success: true, idJurnal: idJurnal };
}

function deleteJournal(idJurnal) {
  const sheet = getSheet("journals");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === idJurnal) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: "Jurnal tidak ditemukan" };
}
`;
