import React, { useState } from 'react';
import { WORKER_URL, YOUR_DOMAIN } from '../../config/constants';
import { toast, copyText } from '../Common/Utils';
import { Icon } from '../Common/Icons';

const CreateLinkView = ({ auth }) => {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiry, setExpiry] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdv, setShowAdv] = useState(false);

  const handleCreate = async () => {
    if (!url) {
      toast('Vui lòng nhập URL', 'error');
      return;
    }
    if (alias && !/^[a-zA-Z0-9-]+$/.test(alias)) {
      toast('Alias chỉ dùng chữ, số, gạch ngang', 'error');
      return;
    }
    setLoading(true);
    try {
      const body = { url };
      if (alias) body.customCode = alias;
      if (
