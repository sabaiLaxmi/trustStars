import sys

with open('app/routes/app.forms.$id.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imageLimit for STARTER to 1
code = code.replace(
    'const imageLimit = currentPlan === "PRO" ? 4 : currentPlan === "STARTER" ? 3 : 0;',
    'const imageLimit = currentPlan === "PRO" ? 4 : currentPlan === "STARTER" ? 1 : 0;'
)

# 2. Hide Remove Branding for STARTER (only show for PRO)
# Note: we replaced it to `{!isFree && <Divider />}` and `{!isFree && (\n                <BlockStack gap="200">` in previous step.
# Let's replace those specific parts.
# We want the branding removal to only show for hasPro.
old_branding_section_1 = '''                {!isFree && <Divider />}

                {/* Branding Removal */}
                {!isFree && ('''

new_branding_section_1 = '''                {hasPro && <Divider />}

                {/* Branding Removal */}
                {hasPro && ('''

code = code.replace(old_branding_section_1, new_branding_section_1)

# Just in case the previous replacement had different formatting:
old_branding_fallback = '''                {!isFree && <Divider />}

                {/* Branding Removal */}
                {!isFree && (
                <BlockStack gap="200">'''

new_branding_fallback = '''                {hasPro && <Divider />}

                {/* Branding Removal */}
                {hasPro && (
                <BlockStack gap="200">'''
code = code.replace(old_branding_fallback, new_branding_fallback)

# One more fallback for the divider before branding removal, just in case
if 'hasPro && <Divider />' not in code:
    code = code.replace(
        '                {!isFree && <Divider />}\n\n                {/* Branding Removal */}\n                {!isFree && (',
        '                {hasPro && <Divider />}\n\n                {/* Branding Removal */}\n                {hasPro && ('
    )

with open('app/routes/app.forms.$id.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("File updated successfully")
