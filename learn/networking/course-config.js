"use strict";

/**
 * Curriculum-level configuration for the networking course.
 * Change chapter references or lab-designation rules here; reader behavior
 * stays independent from the specific course sequence.
 */
(() => {
  const readerPageLabels=["WHY ENGINEERS CARE","SYSTEM MODEL","ENGINEERING CASE","HANDS-ON PRACTICE","TRANSFER CHECKPOINT"];
 const researchSources={
  "1":[["Kurose & Ross, Computer Networking: A Top-Down Approach, 9th ed. (Pearson)","https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/P200000013385/9780135415603"],["Saltzer, Reed, and Clark, End-to-End Arguments in System Design, ACM TOCS","https://dl.acm.org/doi/10.1145/357401.357402"],["MIT 6.033, Networking Part I","https://ocw.mit.edu/courses/6-033-computer-system-engineering-spring-2018/pages/week-5/"]],
  "2":[["Kurose & Ross, Computer Networking: A Top-Down Approach, Chapter 2","https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/P200000013385/9780135415603"],["Stanford CS144, Introduction to Computer Networking","https://www.cs.stanford.edu/academics-courses-schedule-autumn-quarter"],["MIT 6.829, Computer Networks","https://ocw.mit.edu/courses/6-829-computer-networks-fall-2002/"]],
  "3":[["Kurose & Ross, Computer Networking: A Top-Down Approach, Chapter 3","https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/P200000013385/9780135415603"],["Jacobson, Congestion Avoidance and Control, ACM SIGCOMM","https://dl.acm.org/doi/10.1145/52324.52356"],["MIT 6.263J, Data Communication Networks","https://ocw.mit.edu/courses/6-263j-data-communication-networks-fall-2002/"]],
  "4":[["Kurose & Ross, Computer Networking: A Top-Down Approach, Chapter 4","https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/P200000013385/9780135415603"],["McKeown et al., OpenFlow: Enabling Innovation in Campus Networks, ACM CCR","https://dl.acm.org/doi/10.1145/1355734.1355746"],["MIT 6.829, Computer Networks","https://ocw.mit.edu/courses/6-829-computer-networks-fall-2002/"]],
  "5":[["Kurose & Ross, Computer Networking: A Top-Down Approach, Chapter 5","https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/P200000013385/9780135415603"],["MIT 6.829, Computer Networks lecture materials","https://ocw.mit.edu/courses/6-829-computer-networks-fall-2002/pages/lecture-notes/"],["ACM SIGCOMM Computer Communication Review","https://dl.acm.org/newsletter/sigcomm-ccr"]],
  "6":[["Kurose & Ross, Computer Networking: A Top-Down Approach, Chapter 6","https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/P200000013385/9780135415603"],["MIT 6.263J, Data Communication Networks","https://ocw.mit.edu/courses/6-263j-data-communication-networks-fall-2002/"],["MIT 6.829, Computer Networks","https://ocw.mit.edu/courses/6-829-computer-networks-fall-2002/"]],
  "7":[["Kurose & Ross, Computer Networking: A Top-Down Approach, Chapter 7","https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/P200000013385/9780135415603"],["MIT 6.263J, Data Communication Networks","https://ocw.mit.edu/courses/6-263j-data-communication-networks-fall-2002/"],["MIT 6.829, Computer Networks","https://ocw.mit.edu/courses/6-829-computer-networks-fall-2002/"]],
  "8":[["Kurose & Ross, Computer Networking: A Top-Down Approach, Chapter 8","https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/P200000013385/9780135415603"],["MIT 6.857, Network and Computer Security","https://ocw.mit.edu/courses/6-857-network-and-computer-security-spring-2014/"],["MIT 6.858, Computer Systems Security, Network Protocols","https://ocw.mit.edu/courses/6-858-computer-systems-security-fall-2014/resources/lecture-13-network-protocols/"]],
  "9":[["Kurose & Ross, Computer Networking: A Top-Down Approach, Chapter 9","https://www.pearson.com/en-us/subject-catalog/p/computer-networking-a-top-down-approach/P200000013385/9780135415603"],["MIT 6.829, Computer Networks","https://ocw.mit.edu/courses/6-829-computer-networks-fall-2002/"],["ACM SIGCOMM Computer Communication Review","https://dl.acm.org/newsletter/sigcomm-ccr"]]
 };
 const chapterLabModules={"01":"module-1-4","02":"module-2-4","03":"module-3-4","04":"module-4-4","05":"module-5-6","06":"module-6-5","07":"module-7-4","08":"module-8-5","09":"module-9-5"};

  window.BIT_FOUNDRY_NETWORKING_CONFIG = Object.freeze({
    readerPageLabels: Object.freeze(readerPageLabels),
    researchSources: Object.freeze(researchSources),
    chapterLabModules: Object.freeze(chapterLabModules)
  });
})();
