"use strict";

/**
 * Course-completion rules shared by the reader and final capstone.
 * Keeps lesson, lab, and capstone state consistent wherever it changes.
 */
(() => {
  const storage = window.BIT_FOUNDRY_NETWORKING_STORAGE;
  const config = window.BIT_FOUNDRY_NETWORKING_CONFIG;
  if (!storage || !config) return;

  const signal = () =>
    window.dispatchEvent(new Event("bitfoundry-course-update"));

  const courseRecord = () => storage.readCourseRecord();

  const saveCourseRecord = (record) => {
    storage.saveCourseRecord(record);
    signal();
    return record;
  };

  const markLessonComplete = (moduleId) => {
    const record = courseRecord();
    if (!record.lessons.includes(moduleId)) {
      record.lessons.push(moduleId);
      saveCourseRecord(record);
    }
    return record;
  };

  const saveLabNote = (chapter, note) => {
    const record = courseRecord();
    record.labNotes[chapter] = note;
    return saveCourseRecord(record);
  };

  const recordLab = (chapter, note) => {
    const record = courseRecord();
    if (!record.labs.includes(chapter)) record.labs.push(chapter);
    record.labNotes[chapter] = note;
    return saveCourseRecord(record);
  };

  const markCapstoneComplete = () => {
    const record = courseRecord();
    if (!record.capstone) {
      record.capstone = true;
      saveCourseRecord(record);
    }
    return record;
  };

  const summarize = (moduleIds) => {
    const record = courseRecord();
    const chapters = Object.fromEntries(
      Object.keys(config.chapterLabModules).map((chapter) => {
        const prefix = "module-" + Number(chapter) + "-";
        const ids = moduleIds.filter((id) => id.startsWith(prefix));
        return [
          chapter,
          {
            total: ids.length,
            complete: ids.filter((id) => record.lessons.includes(id)).length,
            labDone: record.labs.includes(chapter)
          }
        ];
      })
    );
    const lessonDone = moduleIds.filter((id) =>
      record.lessons.includes(id)
    ).length;
    const labTotal = Object.keys(config.chapterLabModules).length;
    const labDone = Object.values(chapters).filter((chapter) => chapter.labDone)
      .length;
    const total = moduleIds.length + labTotal + 1;
    const done = lessonDone + labDone + (record.capstone ? 1 : 0);

    return {
      record,
      chapters,
      lessonTotal: moduleIds.length,
      lessonDone,
      labTotal,
      labDone,
      capstoneDone: record.capstone,
      total,
      done,
      complete:
        lessonDone === moduleIds.length &&
        labDone === labTotal &&
        record.capstone === true
    };
  };

  window.BIT_FOUNDRY_NETWORKING_PROGRESS = Object.freeze({
    courseRecord,
    saveCourseRecord,
    markLessonComplete,
    saveLabNote,
    recordLab,
    markCapstoneComplete,
    summarize
  });
})();
