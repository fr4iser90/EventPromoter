// Email Panel Configuration
// This defines the UI structure for email platform content/features

export const emailPanelConfig = {
  title: "Email Content",
  sections: [
    {
      id: "recipients",
      title: "Email Recipients",
      component: "recipient-selector",
      props: {
        source: "email-config",
        multiple: true,
        allowCustom: true,
        allowGroups: true,
        allowImport: true,
        showTabs: true,
        required: true
      }
    }
  ]
}
