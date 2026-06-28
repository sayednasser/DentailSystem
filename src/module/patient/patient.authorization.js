import { RoleEnum } from "../../common/index.js";

export const endpoint = {
  createReception: [RoleEnum.Admin],
  createDoctor: [RoleEnum.Admin],
  getAdminDashboard: [RoleEnum.Admin,RoleEnum.Reception,RoleEnum.Doctor],

  deletePatient: [ RoleEnum.Admin],
  deleteUser: [ RoleEnum.Admin],
  createPatient: [RoleEnum.Reception, RoleEnum.Admin],
  updatePatient: [RoleEnum.Reception, RoleEnum.Admin, RoleEnum.Doctor],
  updatePatientDoctor: [ RoleEnum.Doctor],
  getDoctorPerformance: [ RoleEnum.Admin],
  getPayments: [RoleEnum.Reception, RoleEnum.Admin, RoleEnum.Doctor],
  getAnalytics: [RoleEnum.Reception, RoleEnum.Admin, RoleEnum.Doctor],
  getAlerts: [RoleEnum.Reception, RoleEnum.Admin, RoleEnum.Doctor],
  getExpenses: [RoleEnum.Admin],
  manageExpenses: [RoleEnum.Admin],
}