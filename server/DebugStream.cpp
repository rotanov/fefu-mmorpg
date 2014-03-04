#include "DebugStream.hpp"

DebugStream::DebugStream(std::ostream &stream, QPlainTextEdit *text_edit)
    : stream_(stream)
{
    logWindow_ = text_edit;
    oldBuffer_ = stream.rdbuf();
    stream.rdbuf(this);
}

DebugStream::~DebugStream()
{
    // output anything that is left
    if (!string_.empty())
    {
        logWindow_->appendPlainText(string_.c_str());
    }

    stream_.rdbuf(oldBuffer_);
}

std::basic_streambuf<char>::int_type DebugStream::overflow(std::basic_streambuf<char>::int_type v)
{
    if (v == '\n')
    {
        logWindow_->appendPlainText(string_.c_str());
        string_.erase(string_.begin(), string_.end());
    }
    else
    {
        string_ += v;
    }

    return v;
}

std::streamsize DebugStream::xsputn(const char *p, std::streamsize n)
{
    string_.append(p, p + n);

    size_t pos = 0;
    while (pos != std::string::npos)
    {
        pos = string_.find('\n');
        if (pos != std::string::npos)
        {
            std::string tmp(string_.begin(), string_.begin() + pos);
            logWindow_->appendPlainText(tmp.c_str());
            string_.erase(string_.begin(), string_.begin() + pos + 1);
        }
    }

    return n;
}


BufferStream::BufferStream(std::ostream &stream, QByteArray &buffer)
    : stream_(stream)
    , outputBuffer_(buffer)
{
    oldBuffer_ = stream.rdbuf();
    stream.rdbuf(this);
}

BufferStream::~BufferStream()
{
    stream_.rdbuf(oldBuffer_);
}

std::basic_streambuf<char>::int_type BufferStream::overflow(int_type v)
{
    outputBuffer_.append(v);
    return v;
}

std::streamsize BufferStream::xsputn(const char *p, std::streamsize n)
{
    outputBuffer_.append(p, n);
    return n;
}
