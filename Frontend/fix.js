const fs = require('fs');
const path = require('path');

const files = [
    'app/help-center/index.jsx',
    'app/legal/index.jsx',
    'app/legal/privacy-policy.jsx',
    'app/legal/terms-of-service.jsx',
    'app/legal/refund-policy.jsx',
    'app/legal/licenses.jsx',
    'app/legal/contact-privacy.jsx',
    'app/sell/index.jsx',
    'app/sell/verify-otp.jsx',
    'app/profile/privacy-center.jsx',
    'app/profile/devices.jsx'
];

files.forEach(file => {
    const fullPath = path.join('d:/onlineMarket/Frontend', file);
    if (!fs.existsSync(fullPath)) {
        // console.log('Skipping ' + file + ' - not found');
        return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes('useSafeAreaInsets')) {
        // console.log('Skipping ' + file + ' - already has useSafeAreaInsets');
        return;
    }

    const importStatement = 'import { useSafeAreaInsets } from "react-native-safe-area-context";\n';
    content = importStatement + content;

    const fnRegex = /export default function [a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/;
    const match = content.match(fnRegex);
    
    if (match) {
        const fnStart = match.index + match[0].length;
        const insertHook = '\n    const insets = useSafeAreaInsets();\n';
        content = content.slice(0, fnStart) + insertHook + content.slice(fnStart);
        
        const returnRegex = /return\s*\(\s*<View\s+className=\"flex-1[^\"]*\"/;
        const returnMatch = content.match(returnRegex);
        if (returnMatch) {
            const insertIndex = returnMatch.index + returnMatch[0].length;
            content = content.slice(0, insertIndex) + ' style={{ paddingTop: insets.top }}' + content.slice(insertIndex);
        } else {
            //  console.log('Could not find return View flex-1 in ' + file);
             
             // Try to find the generic outermost view returning
             const returnGeneric = /return\s*\(\s*<View/;
             const returnMatchGeneric = content.match(returnGeneric);
             if (returnMatchGeneric) {
                 const insertIndexGeneric = returnMatchGeneric.index + returnMatchGeneric[0].length;
                 content = content.slice(0, insertIndexGeneric) + ' style={{ paddingTop: insets.top }}' + content.slice(insertIndexGeneric);
             }
        }
    } else {
        // console.log('Could not find function definition in ' + file);
    }
    
    fs.writeFileSync(fullPath, content);
    // console.log('Updated ' + file);
});
