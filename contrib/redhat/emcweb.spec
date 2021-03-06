Name: emcweb
Version: 2.2.1
Release: 1%{?dist}
Summary: Emercoin Web Wallet
Group: Applications/Internet
Vendor: Aspanta Limited
License: GPLv3
URL: https://www.emercoin.com
Source0: %{name}-%{version}.tar.gz
BuildArch: noarch
BuildRoot: %(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)
Requires: emercoin emcssh openssl httpd httpd-devel mod_ssl mysql supervisor gcc python34-pip python34-devel libffi-devel
AutoReqProv: no

%global _python_bytecompile_errors_terminate_build 0

%description
Emercoin Web Wallet

%prep
%setup -q

%build

%install
%{__rm} -rf $RPM_BUILD_ROOT
%{__mkdir} -p $RPM_BUILD_ROOT/var/lib/emcweb $RPM_BUILD_ROOT%{_sbindir} $RPM_BUILD_ROOT/etc/ssl/emc $RPM_BUILD_ROOT/etc/httpd/conf.d $RPM_BUILD_ROOT/etc/supervisord.d
%{__cp} -r engine/* $RPM_BUILD_ROOT/var/lib/emcweb/
%{__install} -m 754 bin/* $RPM_BUILD_ROOT%{_sbindir}
%{__install} -m 644 certs/emcssl_ca.crt $RPM_BUILD_ROOT/etc/ssl/emc
%{__install} -m 644 certs/emcssl_ca.key $RPM_BUILD_ROOT/etc/ssl/emc
%{__install} -m 644 config/apache/emcweb-rhel.conf $RPM_BUILD_ROOT/etc/httpd/conf.d/emcweb.conf
%{__install} -m 600 config/supervisor/emcweb_celery.conf $RPM_BUILD_ROOT/etc/supervisord.d/emcweb_celery.ini
%{__install} -m 600 config/supervisor/emcweb_restart_providers.conf $RPM_BUILD_ROOT/etc/supervisord.d/emcweb_restart_providers.ini

%clean
%{__rm} -rf $RPM_BUILD_ROOT

%pretrans
getent passwd emc >/dev/null || { echo "User 'emc' not found. Probably you have to reinstall the 'emercoin' package."; exit 1; }

%post
[ $1 == 1 ] && {
  [ -f /var/lib/emc/.emercoin/emercoin.conf ] || { echo "Configuration file '/var/lib/emc/.emercoin/emercoin.conf' not found."; exit 2; }
  [ ! -f /etc/ssl/emc/emcweb.key ] || [ ! -f /etc/ssl/emc/emcweb.crt ] && {
    openssl req -nodes -x509 -newkey rsa:4096 -keyout /etc/ssl/emc/emcweb.key -out /etc/ssl/emc/emcweb.crt -days 3560 -subj /C=CY/L=Nicosia/O=Emercoin/CN=emercoin.emc >/dev/null 2>&1
    chown emc.emc /etc/ssl/emc/emcweb.key /etc/ssl/emc/emcweb.crt
    chmod 600 /etc/ssl/emc/emcweb.key
  } || true
  touch /etc/emercoin/emcssh.keys.d/emcweb
  chown emc.emc /etc/emercoin/emcssh.keys.d/emcweb
} || exit 0

%posttrans
pip3 install --upgrade pip
pip3 install mod_wsgi virtualenv || exit 3
mod_wsgi-express install-module
mod_wsgi-express module-config > /etc/httpd/conf.modules.d/00-wsgi.conf
[ ! -d /var/lib/emcweb/.env ] && virtualenv -p python3 /var/lib/emcweb/.env
/var/lib/emcweb/.env/bin/pip3 install -r /var/lib/emcweb/requirements.txt || exit 4

%files
%doc LICENSE
%attr(751,emc,emc)    %dir /var/lib/emcweb
%attr(644,root,root)  %config(noreplace) /etc/httpd/conf.d/emcweb.conf
%attr(644,root,root)  %config(noreplace) /etc/supervisord.d/emcweb_celery.ini
%attr(644,root,root)  %config(noreplace) /etc/supervisord.d/emcweb_restart_providers.ini
%attr(644,emc,emc)    /etc/ssl/emc/emcssl_ca.crt
%attr(644,emc,emc)    /etc/ssl/emc/emcssl_ca.key
%attr(-,emc,emc)      /var/lib/emcweb/*
%attr(-,root,root)    /usr/sbin/*

%changelog
* Thu Feb 02 2017 Sergii Vakula <sv@aspanta.com> 2.0
- There is no changelog availavle. Please refer to the CHANGELOG file.
