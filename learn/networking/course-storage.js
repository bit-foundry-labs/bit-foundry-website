"use strict";

/**
 * Browser-local course persistence.
 * This is the single storage boundary for the networking course. It preserves
 * the existing keys so current student progress and journal entries remain intact.
 */
(() => {
  const keys = Object.freeze({
    journal: "bitfoundry-networking-journal-v1",
    course: "bitfoundry-networking-course-v1",
    resume: "bitfoundry-networking-resume-v1",
    lessonNotePrefix: "bitfoundry-notes-"
  });

  const readJson = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value && typeof value === "object" ? value : fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const readJournal = () => readJson(keys.journal, {});
  const saveJournal = (record) => writeJson(keys.journal, record);

  const normalizeCourseRecord = (value) => ({
    lessons: Array.isArray(value.lessons) ? value.lessons : [],
    labs: Array.isArray(value.labs) ? value.labs : [],
    labNotes: value.labNotes && typeof value.labNotes === "object" ? value.labNotes : {},
    capstone: value.capstone === true
  });

  const readCourseRecord = () => normalizeCourseRecord(readJson(keys.course, {}));
  const saveCourseRecord = (record) =>
    writeJson(keys.course, normalizeCourseRecord(record));

  const readResume = () => readJson(keys.resume, null);
  const saveResume = (record) => writeJson(keys.resume, record);

  const readLessonNote = (moduleId) =>
    localStorage.getItem(keys.lessonNotePrefix + moduleId) || "";
  const saveLessonNote = (moduleId, value) =>
    localStorage.setItem(keys.lessonNotePrefix + moduleId, value);

  window.BIT_FOUNDRY_NETWORKING_STORAGE = Object.freeze({
    keys,
    readJournal,
    saveJournal,
    readCourseRecord,
    saveCourseRecord,
    readResume,
    saveResume,
    readLessonNote,
    saveLessonNote
  });
})();
