Required Environment Variables:
-------------------------------
- WATCH_DIRECTORY (Default: /opt/incoming)
- R_SOCKET_PORT   (Default: 12345)
- FE_PORT         (Default: 12346)
- PAIV_URI        (Default: http://9.127.37.57:9029/inference (8 pins) / 
                            http://9.127.37.57:9030/inference (18 pins) / 
                            http://9.127.37.87:9024/inference (old))

Make Sure Port Is open:
-----------------------
-A INPUT -p tcp -m tcp --dport 12345 -j ACCEPT 

Linux Shared Folder Settings
----------------------------
```
/etc/samba/smb.conf:
[SHARED1]
	comment = Hafiz RHEL
        path = /opt/SHARED
	writeable = yes
	browseable = yes
	public = yes
	guest ok = yes
	create mask = 0777
	directory mask = 0777
        force user = shareuser
        force group = users

[INCOMING1]
        comment = Incoming
        path = /opt/incoming
        writeable = yes
        browseable = yes
        public = yes
        guest ok = yes
        create mask = 0777
        directory mask = 0777
        force user = nobody
        force group = nogroup
```
- sudo chown -R nobody.nogroup /opt/incoming
- sudo chmod -R 777 /opt/incoming

- # sudo smbpasswd -a shareuser
- # sudo chown shareuser:root /opt/incoming

- systemctl restart nmb
- systemctl restart smb

Change Security Context
-----------------------
$ sestatus
$ sudo setenforce Permissive

https://superuser.com/questions/1321130/chmodding-files-with-an-selinux-security-context-acl

Installing Cloudant Locally
---------------------------
https://www.ibm.com/support/knowledgecenter/en/SSTPQH_1.0.0/com.ibm.cloudant.local.install.doc/topics/clinstall_extract_install_cloudant_local.html

Web Cam + Snapshot HTML5
------------------------
https://davidwalsh.name/browser-camera


Labels
------
DEFECT CONDITIONS

let defectConditions = [
    {
        label: "no_extra",
        confidence: 1
    },
    {
        label: "extra",
        confidence: 0.5
    }
];
let defaultDefectCondition = 0.9;
