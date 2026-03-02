// src/components/registration/RegistrationConstants.ts

export const titleOptions = ["Mr.", "Mrs.", "Ms.", "Dr.", "Atty.", "Engr.", "Arch.", "Prof.", "Rev."];

export const departmentOptions = [
  {
    name: "GRADUATE SCHOOL",
    courses: [
      { name: "MASTER OF ARTS IN EDUCATION (MAED)", majors: ["EDUCATIONAL MANAGEMENT", "GUIDANCE & COUNSELING", "PHYSICAL EDUCATION", "TEACHING ENGLISH", "TEACHING MATHEMATICS", "TEACHING SCIENCE"] },
      { name: "MASTER IN BUSINESS ADMINISTRATION", majors: [] },
      { name: "MASTER IN MANAGEMENT", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF ENGINEERING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN COMPUTER ENGINEERING", majors: [] },
      { name: "BACHELOR OF SCIENCE IN ELECTRICAL ENGINEERING", majors: [] },
      { name: "BACHELOR OF SCIENCE IN ELECTRONICS ENGINEERING", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF ARTS AND SCIENCES EDUCATION",
    courses: [
      { name: "BACHELOR OF ARTS IN ENGLISH LANGUAGE", majors: [] }, 
      { name: "BACHELOR OF SCIENCE IN PSYCHOLOGY", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF ACCOUNTING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN ACCOUNTANCY", majors: [] },
      { name: "BACHELOR OF SCIENCE IN ACCOUNTING TECHNOLOGY", majors: [] },
      { name: "BACHELOR OF SCIENCE IN MANAGEMENT ACCOUNTING", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF TEACHER EDUCATION",
    courses: [
      { name: "BACHELOR OF ELEMENTARY EDUCATION (GENERALIST)", majors: [] },
      { name: "BACHELOR OF PHYSICAL EDUCATION", majors: [] },
      { name: "BACHELOR OF SECONDARY EDUCATION", majors: ["ENGLISH", "FILIPINO", "MATHEMATICS", "SCIENCE", "SOCIAL STUDIES"] }
    ]
  },
  {
    name: "DEPARTMENT OF BUSINESS ADMINISTRATION EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION", majors: ["FINANCIAL MANAGEMENT", "HUMAN RESOURCE MANAGEMENT", "MARKETING MANAGEMENT"] },
      { name: "BACHELOR OF SCIENCE IN COMMERCE", majors: ["MANAGEMENT"] }
    ]
  },
  {
    name: "DEPARTMENT OF HOSPITALITY EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT", majors: [] },
      { name: "BACHELOR OF SCIENCE IN HOTEL AND RESTAURANT MANAGEMENT", majors: [] },
      { name: "BACHELOR OF SCIENCE IN TOURISM MANAGEMENT", majors: [] },
      { name: "BACHELOR OF ARTS IN ECONOMICS", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF CRIMINAL JUSTICE EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN CRIMINOLOGY", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF COMPUTING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN COMPUTER SCIENCE", majors: [] },
      { name: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF NURSING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN NURSING", majors: [] }
    ]
  }
];

export const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};