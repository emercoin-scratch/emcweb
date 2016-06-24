Name:           emcweb
Version:        1.0
Release:        1%{?dist}
Summary:        Emercoin Web Wallet
Group:          Applications/Internet
Vendor:         Emercoin
License:        GPLv3
URL:            http://www.emercoin.com
Source0:        %{name}.tar.gz
BuildArch:      noarch
BuildRoot:      %(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)
Requires:       emercoin emcssh pwgen httpd mod_wsgi mod_ssl openssl = 1:1.0.2d1 python-flask python-requests

%description
Emercoin Web Wallet

%prep
%setup -q -n emcweb

%build

%install
%{__rm} -rf $RPM_BUILD_ROOT
%{__mkdir} -p $RPM_BUILD_ROOT/var/lib/emcweb/config $RPM_BUILD_ROOT%{_sbindir} $RPM_BUILD_ROOT/etc/ssl/emc $RPM_BUILD_ROOT/etc/httpd/conf.d
%{__cp} -r engine/* $RPM_BUILD_ROOT/var/lib/emcweb
%{__install} -m 754 bin/* $RPM_BUILD_ROOT%{_sbindir}
%{__install} -m 644 certs/emcssl_ca.crt $RPM_BUILD_ROOT/etc/ssl/emc
%{__install} -m 644 config/emcweb.apache2.conf $RPM_BUILD_ROOT/etc/httpd/conf.d/emcweb.conf
%{__install} -m 600 contrib/build.el7/rpc.config $RPM_BUILD_ROOT/var/lib/emcweb/config/rpc

%clean
%{__rm} -rf $RPM_BUILD_ROOT

%pretrans
getent passwd emc >/dev/null || { echo "User 'emc' not found. Probably you have to reinstall the 'emercoin' package."; exit 1; }

%post
[ $1 == 1 ] && {
  [ -f /var/lib/emc/.emercoin/emercoin.conf ] || { echo "Configuration file '/var/lib/emc/.emercoin/emercoin.conf' not found."; exit 2; }
  [ ! -f /etc/ssl/emc/emcweb.key ] || [ ! -f /etc/ssl/emc/emcweb.crt ] && {
    openssl req -nodes -x509 -newkey rsa:4096 -keyout /etc/ssl/emc/emcweb.key -out /etc/ssl/emc/emcweb.crt -days 3560 -subj /C=US/ST=Oregon/L=Portland/O=IT/CN=emercoin.emc
    chown emc.emc /etc/ssl/emc/emcweb.key /etc/ssl/emc/emcweb.crt
  } || true
  sed -i -e "s+\(^\"password\"\)\(.*\)+\"password\": \"$(grep rpcpassword /var/lib/emc/.emercoin/emercoin.conf | sed 's/rpcpassword=//')\",+" /var/lib/emcweb/config/rpc
  sed -i -e "s/\(app.secret_key\)\(.*\)/app.secret_key = '$(pwgen 30 1)'/" /var/lib/emcweb/server.py
  touch /etc/emercoin/emcssh.keys.d/emcweb
 } || exit 0

%posttrans
setsebool -P httpd_can_network_connect on
semanage fcontext -a -t httpd_sys_rw_content_t "/var/lib/emcweb(/.*)?"
restorecon -R /var/lib/emcweb
systemctl status httpd >/dev/null && systemctl restart httpd || exit 0

%files
%doc LICENSE
%attr(751,emc,emc)   %dir /var/lib/emcweb
%attr(644,root,root) %config(noreplace) /etc/httpd/conf.d/emcweb.conf
%attr(644,emc,emc)   /etc/ssl/emc/emcssl_ca.crt
%attr(-,emc,emc)     /var/lib/emcweb/*
%attr(-,root,root)   /usr/sbin/*

%changelog
* Tue Jun 21 2016 Sergii Vakula <sv@emercoin.com> 0.0.3
- Initial release
