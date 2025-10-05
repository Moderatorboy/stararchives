#!/data/data/com.termux/files/usr/bin/bash
# adjust path if needed
cd /storage/emulated/0/b2gpt-archive-project || cd ~/b2gpt-archive-project
python3 automation/full_automation.py
git add playlist.json
git commit -m "Auto-update from Termux"
git push origin main
echo "✅ Site updated from Termux"
