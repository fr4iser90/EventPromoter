// Email Settings Configuration
// This defines the platform settings (credentials, config) for email

export const emailSettingsConfig = {
  title: "Email Platform Settings",
  sections: [
    {
      id: "smtp",
      title: "SMTP Configuration",
      component: "settings-form",
      props: {
        fields: [
          {
            name: "host",
            type: "text",
            label: "SMTP Host",
            placeholder: "smtp.gmail.com",
            required: true,
            validation: "hostname"
          },
          {
            name: "port",
            type: "number",
            label: "Port",
            placeholder: "587",
            default: 587,
            required: true,
            validation: "port"
          },
          {
            name: "username",
            type: "email",
            label: "Username",
            required: true
          },
          {
            name: "password",
            type: "password",
            label: "Password",
            required: true
          },
          {
            name: "fromEmail",
            type: "email",
            label: "From Email",
            required: true
          },
          {
            name: "fromName",
            type: "text",
            label: "From Name",
            placeholder: "Your Name"
          }
        ]
      }
    }
  ]
}
