export interface ColumnConfig {
  key: string;
  label: string;
  hidden?: boolean;
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'actions';
  buttons?: {
    label: string;
    action: string;
    icon?: string;
    color?: string;
  }[];
}

export const ChannelRableSettings: ColumnConfig[] = [
  {
    key: 'channelID',
    label: 'Id Canal',
    sortable: true,
    type: 'text'
    //width: '50px'
  },
  {
    key: 'gln',
    label: 'GLN',
    sortable: true,
    type: 'text'
  },
  {
    key: 'provider',
    label: 'Proveedor',
    sortable: false,
    type: 'text'
  },
  {
    key: 'extension',
    label: 'Extensión',
    sortable: false,
    type: 'text'
    //hidden: true // Oculta esta columna
  },
  {
    key: 'adaptation_type',
    label: 'Tipo Adaptación',
    sortable: false,
    type: 'text'
  },
  {
    key: 'renaming_type',
    label: 'Tipo Renombrado',
    sortable: false,
    type: 'text'
  },
  {
    key: 'actions',
    label: 'Acciones',
    type: 'actions',
    buttons: [
      { label: 'Editar', action: 'edit', icon: 'edit', color: 'primary' }
    ]
  }
];
