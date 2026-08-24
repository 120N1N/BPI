import { Injectable } from '@angular/core';
import { ModuleItem } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private mainModules: ModuleItem[] = [
    { name: 'COMM', icon: '/assets/icons/comm.png' },
    { name: 'HR', icon: '/assets/icons/hr.png' },
    { name: 'IT', icon: '/assets/icons/it.png' },
    { name: 'LEGAL', icon: '/assets/icons/legal.png' },
    { name: 'FIN', icon: '/assets/icons/fin.png' },
    { name: 'PPIC', icon: '/assets/icons/ppic.png' },
    { name: 'PROD', icon: '/assets/icons/prod.png' },
    { name: 'WHS OS', icon: '/assets/icons/whs_os.png' },
    { name: 'MR', icon: '/assets/icons/mr.png' },
    { name: 'ENG', icon: '/assets/icons/eng.png' },
    { name: 'FABRIC', icon: '/assets/icons/fabric.png' },
    { name: 'MTN', icon: '/assets/icons/mtn.png' },
    { name: 'PROC', icon: '/assets/icons/proc.png' },
    { name: 'QHSE', icon: '/assets/icons/qhse.png' },
    { name: 'IC', icon: '/assets/icons/ic.png' },
    { name: 'WMS', icon: '/assets/icons/wms.png' },
    { name: 'APPR', icon: '/assets/icons/appr.png' },
    { name: 'HELPDESK', icon: '/assets/icons/helpdesk.png' }
  ];

  private subModules: ModuleItem[] = [
    { name: 'QHSE RESOURCES', icon: '/assets/icons/sub_qhse.png' },
    { name: 'SPO BLAST', icon: '/assets/icons/sub_spo.png' },
    { name: 'MATERIAL RESERVATION', icon: '/assets/icons/sub_mr.png' },
    { name: 'BON SEMENTARA', icon: '/assets/icons/sub_bon.png' },
    { name: 'WHISTLEBLOWER', icon: '/assets/icons/sub_whistle.png' }
  ];

  getMainModules(): ModuleItem[] {
    return [...this.mainModules];
  }

  getSubModules(): ModuleItem[] {
    return [...this.subModules];
  }
}
