# Page snapshot

```yaml
- generic:
  - generic [ref=e1]:
    - paragraph [ref=e7]
    - generic [ref=e11]:
      - paragraph [ref=e15]: W E L C O M E
      - generic [ref=e17]:
        - generic [ref=e18]:
          - img [ref=e22]
          - textbox "Email" [ref=e26]: fpa.testautomation@fisherpaykel.com
        - generic [ref=e27]:
          - img [ref=e31]
          - textbox "Password" [active] [ref=e35]: Fpasfccakl@2025
        - button "L O G I N" [ref=e37] [cursor=pointer]:
          - generic [ref=e38]: L O G I N
        - generic [ref=e39]:
          - link "Forgot password?" [ref=e41] [cursor=pointer]:
            - /url: javascript:void(0)
          - link "Create Account" [ref=e43] [cursor=pointer]:
            - /url: javascript:void(0)
      - generic [ref=e44]:
        - generic:
          - list
      - link "< Back" [ref=e48] [cursor=pointer]:
        - /url: ../redirect?to=home
  - generic [ref=e49]: Login
```