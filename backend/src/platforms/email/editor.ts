// Email Editor Configuration
// This defines the UI structure for email content creation

export const emailEditorConfig = {
  title: "Email Content",
  sections: [
    {
      id: "content",
      title: "Email Content",
      component: "email-content-editor",
      props: {
        showSubject: true,
        showHtml: true,
        showPreview: true,
        maxLength: 50000
      }
    }
  ]
}
